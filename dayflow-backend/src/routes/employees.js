import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'
import { nextLoginId } from '../utils/loginId.js'

const router = Router()

// ─── GET /employees ──────────────────────────────────────────────────────────
// Returns all employees in the same company as the caller.
// § 3 — grid of employee cards; includes live status field.
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.department, e.status, e.avatar_url AS avatarUrl,
              u.email, u.login_id AS loginId, u.role
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE u.company_id = ?
       ORDER BY e.name`,
      [req.user.companyId]
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /employees:', err)
    res.status(500).json({ error: 'Failed to fetch employees.' })
  }
})

// ─── GET /employees/:id ──────────────────────────────────────────────────────
// Returns full profile. § 8: employees may view peers in view-only mode.
router.get('/:id', auth, async (req, res) => {
  try {
    const [[emp]] = await pool.query(
      `SELECT e.id, e.name, e.department, e.manager, e.mobile, e.about,
              e.skills, e.certifications, e.interests, e.status,
              e.avatar_url AS avatarUrl, e.join_date AS joinDate,
              u.email, u.login_id AS loginId, u.role, u.company_id AS companyId
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE e.id = ? AND u.company_id = ?`,
      [req.params.id, req.user.companyId]
    )
    if (!emp) return res.status(404).json({ error: 'Employee not found.' })

    // Parse JSON fields stored as strings by MySQL
    emp.skills         = safeJson(emp.skills, [])
    emp.certifications = safeJson(emp.certifications, [])
    emp.interests      = safeJson(emp.interests, [])

    res.json(emp)
  } catch (err) {
    console.error('GET /employees/:id:', err)
    res.status(500).json({ error: 'Failed to fetch employee.' })
  }
})

// ─── POST /employees — admin only ────────────────────────────────────────────
// Creates a new employee account. SKILL.md §1: employees don't self-register.
router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('mobile').trim().notEmpty().withMessage('Mobile is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const { name, email, department, mobile, manager, about } = req.body
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // Check duplicate email
      const [[exists]] = await conn.query('SELECT id FROM users WHERE email = ?', [email])
      if (exists) {
        await conn.rollback()
        return res.status(409).json({ error: 'Email already registered.' })
      }

      // Get company code for login_id generation
      const [[company]] = await conn.query(
        'SELECT code FROM companies WHERE id = ?', [req.user.companyId]
      )

      const [firstName, ...rest] = name.trim().split(' ')
      const lastName = rest.join(' ') || firstName
      const joinYear = new Date().getFullYear()
      const loginId = await nextLoginId(
        pool, company.code, firstName, lastName, joinYear, req.user.companyId
      )

      // System-generated initial password (SKILL.md §1: shown once / emailed)
      const initialPassword = generateTempPassword()
      const passwordHash = await bcrypt.hash(initialPassword, Number(process.env.BCRYPT_ROUNDS) || 10)

      const [userResult] = await conn.query(
        `INSERT INTO users (company_id, login_id, email, password_hash, role, first_login)
         VALUES (?, ?, ?, ?, 'employee', 1)`,
        [req.user.companyId, loginId, email, passwordHash]
      )
      const userId = userResult.insertId

      const [empResult] = await conn.query(
        `INSERT INTO employees (user_id, name, department, manager, mobile, about, join_date)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
        [userId, name, department, manager || null, mobile, about || null]
      )
      const employeeId = empResult.insertId

      // Seed default leave allocations
      const [types] = await conn.query('SELECT id FROM leave_types')
      const defaults = { 1: 24, 2: 7, 3: 0 }
      for (const lt of types) {
        await conn.query(
          'INSERT IGNORE INTO leave_allocations (employee_id, leave_type_id, total_days) VALUES (?,?,?)',
          [employeeId, lt.id, defaults[lt.id] ?? 0]
        )
      }

      await conn.commit()

      res.status(201).json({
        message: 'Employee created.',
        employee: { id: employeeId, name, email, loginId, department },
        // In production this would be emailed; for hackathon we return it in the response
        initialPassword,
        note: 'Share the initialPassword with the employee securely. They must change it on first login.'
      })
    } catch (err) {
      await conn.rollback()
      console.error('POST /employees:', err)
      res.status(500).json({ error: 'Failed to create employee.' })
    } finally {
      conn.release()
    }
  }
)

// ─── PUT /employees/:id — self (non-salary fields) or admin ─────────────────
router.put(
  '/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('department').optional().trim().notEmpty(),
    body('mobile').optional().trim().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    // Employee can only update their own profile
    const targetId = Number(req.params.id)
    if (req.user.role !== 'admin' && req.user.employeeId !== targetId) {
      return res.status(403).json({ error: 'Cannot edit another employee\'s profile.' })
    }

    const { name, department, mobile, manager, about, skills, certifications, interests } = req.body
    try {
      await pool.query(
        `UPDATE employees SET
           name           = COALESCE(?, name),
           department     = COALESCE(?, department),
           mobile         = COALESCE(?, mobile),
           manager        = COALESCE(?, manager),
           about          = COALESCE(?, about),
           skills         = COALESCE(?, skills),
           certifications = COALESCE(?, certifications),
           interests      = COALESCE(?, interests)
         WHERE id = ?`,
        [
          name || null, department || null, mobile || null, manager || null,
          about || null,
          skills ? JSON.stringify(skills) : null,
          certifications ? JSON.stringify(certifications) : null,
          interests ? JSON.stringify(interests) : null,
          targetId
        ]
      )
      res.json({ message: 'Profile updated.' })
    } catch (err) {
      console.error('PUT /employees/:id:', err)
      res.status(500).json({ error: 'Failed to update employee.' })
    }
  }
)

// ─── Helpers ─────────────────────────────────────────────────────────────────
function safeJson(val, fallback) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return fallback } }
  return fallback
}

function generateTempPassword() {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()
}

export default router
