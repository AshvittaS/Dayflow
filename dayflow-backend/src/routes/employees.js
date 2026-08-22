import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'
import { nextLoginId } from '../utils/loginId.js'

const router = Router()

// Configure avatar uploads directory
const avatarDir = path.resolve('uploads/avatars')
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error('Only PNG, JPG, JPEG, WEBP, SVG files are allowed.'))
  }
})

// ─── GET /employees ──────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.department, e.title, e.location, e.status, 
              e.avatar_url AS avatarUrl, e.mobile,
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
router.get('/:id', auth, async (req, res) => {
  try {
    const [[emp]] = await pool.query(
      `SELECT e.id, e.name, e.department, e.title, e.location, e.manager, e.mobile, 
              e.about, e.skills, e.certifications, e.interests, e.status,
              e.date_of_birth AS dateOfBirth, e.gender, e.address,
              e.avatar_url AS avatarUrl, e.join_date AS joinDate,
              u.email, u.login_id AS loginId, u.role, u.company_id AS companyId
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE e.id = ? AND u.company_id = ?`,
      [req.params.id, req.user.companyId]
    )
    if (!emp) return res.status(404).json({ error: 'Employee not found.' })

    emp.skills         = safeJson(emp.skills, [])
    emp.certifications = safeJson(emp.certifications, [])
    emp.interests      = safeJson(emp.interests, [])

    res.json(emp)
  } catch (err) {
    console.error('GET /employees/:id:', err)
    res.status(500).json({ error: 'Failed to fetch employee.' })
  }
})

// ─── POST /employees — admin/HR only (Create Employee) ────────────────────────
router.post(
  '/',
  auth,
  requireRole(['admin', 'hr', 'hr_officer']),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('department').trim().notEmpty().withMessage('Department is required.'),
    body('mobile').trim().notEmpty().withMessage('Mobile is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const { name, email, department, title, location, mobile, manager, about, monthWage, avatarUrl } = req.body
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

      // System-generated initial password
      const initialPassword = generateTempPassword()
      const passwordHash = await bcrypt.hash(initialPassword, Number(process.env.BCRYPT_ROUNDS) || 10)

      const [userResult] = await conn.query(
        `INSERT INTO users (company_id, login_id, email, password_hash, role, first_login)
         VALUES (?, ?, ?, ?, 'employee', 1)`,
        [req.user.companyId, loginId, email, passwordHash]
      )
      const userId = userResult.insertId

      const [empResult] = await conn.query(
        `INSERT INTO employees (user_id, name, department, title, location, manager, mobile, about, avatar_url, join_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [userId, name, department, title || department, location || 'Bengaluru', manager || null, mobile, about || null, avatarUrl || null]
      )
      const employeeId = empResult.insertId

      // Initialize salary structure if provided
      const baseWage = Number(monthWage) || 50000
      const [salaryResult] = await conn.query(
        `INSERT INTO salary_structures 
         (employee_id, wage_type, salary_type, month_wage, working_days_per_week, break_time_hrs, pf_employee_pct, pf_employer_pct, professional_tax)
         VALUES (?, 'Fixed', 'Monthly', ?, 5, 1, 12.00, 12.00, 200.00)`,
        [employeeId, baseWage]
      )
      const salaryStructureId = salaryResult.insertId

      // Insert formula-locked components
      const components = [
        { label: 'Basic Salary', percent: 50, amount: (baseWage * 0.5) },
        { label: 'House Rent Allowance', percent: 25, amount: (baseWage * 0.25) },
        { label: 'Special Allowance', percent: 15, amount: (baseWage * 0.15) },
        { label: 'Standard Allowance', percent: 10, amount: (baseWage * 0.10) }
      ]
      for (const c of components) {
        await conn.query(
          `INSERT INTO salary_components (salary_structure_id, label, percent, amount) VALUES (?, ?, ?, ?)`,
          [salaryStructureId, c.label, c.percent, c.amount]
        )
      }

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
        message: 'Employee created successfully.',
        employee: { id: employeeId, name, email, loginId, department, avatarUrl },
        initialPassword,
        note: 'Share the initialPassword with the employee securely.'
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

// ─── POST /employees/:id/avatar — upload profile photo ───────────────────────
router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  const targetId = Number(req.params.id)
  const isAdmin = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'hr_officer'
  const isSelf = Number(req.user.employeeId) === targetId

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Cannot edit another employee\'s avatar.' })
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No avatar file uploaded.' })
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`
  try {
    await pool.query('UPDATE employees SET avatar_url = ? WHERE id = ?', [avatarUrl, targetId])
    res.json({ message: 'Profile photo updated successfully.', avatarUrl })
  } catch (err) {
    console.error('POST /employees/:id/avatar:', err)
    res.status(500).json({ error: 'Failed to update avatar.' })
  }
})

// ─── PUT /employees/:id — self (personal details) or admin/HR (all fields) ────
router.put(
  '/:id',
  auth,
  async (req, res) => {
    const targetId = Number(req.params.id)
    const isAdmin = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'hr_officer'
    const isSelf = Number(req.user.employeeId) === targetId

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Cannot edit another employee\'s profile.' })
    }

    const {
      name,
      department,
      title,
      location,
      mobile,
      manager,
      status,
      about,
      skills,
      certifications,
      interests,
      dateOfBirth,
      gender,
      address,
      avatarUrl,
      monthWage
    } = req.body

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      await conn.query(
        `UPDATE employees SET
           name           = COALESCE(?, name),
           department     = ${isAdmin ? 'COALESCE(?, department)' : 'department'},
           title          = ${isAdmin ? 'COALESCE(?, title)' : 'title'},
           location       = ${isAdmin ? 'COALESCE(?, location)' : 'location'},
           status         = ${isAdmin ? 'COALESCE(?, status)' : 'status'},
           manager        = ${isAdmin ? 'COALESCE(?, manager)' : 'manager'},
           mobile         = COALESCE(?, mobile),
           about          = COALESCE(?, about),
           date_of_birth  = COALESCE(?, date_of_birth),
           gender         = COALESCE(?, gender),
           address        = COALESCE(?, address),
           avatar_url     = COALESCE(?, avatar_url),
           skills         = COALESCE(?, skills),
           certifications = COALESCE(?, certifications),
           interests      = COALESCE(?, interests)
         WHERE id = ?`,
        [
          name || null,
          ...(isAdmin ? [department || null, title || null, location || null, status || null, manager || null] : []),
          mobile || null,
          about || null,
          dateOfBirth || null,
          gender || null,
          address || null,
          avatarUrl || null,
          skills ? JSON.stringify(skills) : null,
          certifications ? JSON.stringify(certifications) : null,
          interests ? JSON.stringify(interests) : null,
          targetId
        ]
      )

      // If admin updated monthWage, recalculate salary components
      if (isAdmin && monthWage && Number(monthWage) > 0) {
        const newWage = Number(monthWage)
        await conn.query(
          `UPDATE salary_structures SET month_wage = ? WHERE employee_id = ?`,
          [newWage, targetId]
        )
        const [[struct]] = await conn.query(
          `SELECT id FROM salary_structures WHERE employee_id = ?`,
          [targetId]
        )
        if (struct) {
          const components = [
            { label: 'Basic Salary', percent: 50, amount: (newWage * 0.5) },
            { label: 'House Rent Allowance', percent: 25, amount: (newWage * 0.25) },
            { label: 'Special Allowance', percent: 15, amount: (newWage * 0.15) },
            { label: 'Standard Allowance', percent: 10, amount: (newWage * 0.10) }
          ]
          for (const c of components) {
            await conn.query(
              `UPDATE salary_components SET amount = ? WHERE salary_structure_id = ? AND label = ?`,
              [c.amount, struct.id, c.label]
            )
          }
        }
      }

      await conn.commit()
      res.json({ message: 'Profile updated successfully.' })
    } catch (err) {
      await conn.rollback()
      console.error('PUT /employees/:id:', err)
      res.status(500).json({ error: 'Failed to update employee.' })
    } finally {
      conn.release()
    }
  }
)

// ─── DELETE /employees/:id — admin only (Delete / Archive Employee) ───────────
router.delete(
  '/:id',
  auth,
  requireRole(['admin', 'hr', 'hr_officer']),
  async (req, res) => {
    const targetId = Number(req.params.id)
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // Find user_id
      const [[emp]] = await conn.query('SELECT user_id FROM employees WHERE id = ?', [targetId])
      if (!emp) {
        await conn.rollback()
        return res.status(404).json({ error: 'Employee not found.' })
      }

      // Delete cascade items
      await conn.query('DELETE FROM time_off_requests WHERE employee_id = ?', [targetId])
      await conn.query('DELETE FROM leave_allocations WHERE employee_id = ?', [targetId])
      await conn.query('DELETE FROM attendance WHERE employee_id = ?', [targetId])
      
      const [[struct]] = await conn.query('SELECT id FROM salary_structures WHERE employee_id = ?', [targetId])
      if (struct) {
        await conn.query('DELETE FROM salary_components WHERE salary_structure_id = ?', [struct.id])
        await conn.query('DELETE FROM salary_structures WHERE id = ?', [struct.id])
      }

      await conn.query('DELETE FROM employees WHERE id = ?', [targetId])
      await conn.query('DELETE FROM users WHERE id = ?', [emp.user_id])

      await conn.commit()
      res.json({ message: 'Employee deleted successfully.' })
    } catch (err) {
      await conn.rollback()
      console.error('DELETE /employees/:id:', err)
      res.status(500).json({ error: 'Failed to delete employee.' })
    } finally {
      conn.release()
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
