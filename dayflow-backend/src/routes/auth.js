import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { nextLoginId } from '../utils/loginId.js'

const router = Router()

// ─── POST /auth/signup ──────────────────────────────────────────────────────
// Creates the company's FIRST admin account.
// SKILL.md §1: employees do NOT self-register; only this admin-creation route
// is exposed publicly. All other employee accounts are created by admin via
// POST /employees (admin-only route).
router.post(
  '/signup',
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required.'),
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('phone').trim().notEmpty().withMessage('Phone is required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match.')
      return true
    })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const { companyName, name, email, phone, password } = req.body
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // Check duplicate email
      const [[existing]] = await conn.query(
        'SELECT id FROM users WHERE email = ?', [email]
      )
      if (existing) {
        await conn.rollback()
        return res.status(409).json({ error: 'Email already registered.' })
      }

      // Derive company code from first 2 uppercase letters of company name
      const rawCode = companyName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) || 'DF'

      // Ensure unique company code
      let companyCode = rawCode
      const [[codeConflict]] = await conn.query(
        'SELECT id FROM companies WHERE code = ?', [companyCode]
      )
      if (codeConflict) companyCode = rawCode + Date.now().toString().slice(-2)

      // Create company
      const [companyResult] = await conn.query(
        'INSERT INTO companies (name, code) VALUES (?, ?)',
        [companyName, companyCode]
      )
      const companyId = companyResult.insertId

      // Generate login_id for admin (serial = 1, first user)
      const [firstName, ...rest] = name.trim().split(' ')
      const lastName = rest.join(' ') || firstName
      const joinYear = new Date().getFullYear()
      const loginId = await nextLoginId(pool, companyCode, firstName, lastName, joinYear, companyId)

      // Hash password
      const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10)

      // Create user
      const [userResult] = await conn.query(
        `INSERT INTO users (company_id, login_id, email, password_hash, role, first_login)
         VALUES (?, ?, ?, ?, 'admin', 0)`,
        [companyId, loginId, email, passwordHash]
      )
      const userId = userResult.insertId

      // Create employee profile
      const [empResult] = await conn.query(
        `INSERT INTO employees (user_id, name, department, mobile, join_date)
         VALUES (?, ?, 'Administration', ?, CURDATE())`,
        [userId, name, phone]
      )
      const employeeId = empResult.insertId

      // Seed default leave allocations for this admin
      await seedLeaveAllocations(conn, employeeId)

      await conn.commit()

      const token = signToken({ id: userId, role: 'admin', companyId, employeeId })
      res.status(201).json({
        token,
        user: { id: userId, employeeId, name, email, loginId, role: 'admin', firstLogin: false }
      })
    } catch (err) {
      await conn.rollback()
      console.error('signup error:', err)
      res.status(500).json({ error: 'Signup failed. Please try again.' })
    } finally {
      conn.release()
    }
  }
)

// ─── POST /auth/signin ──────────────────────────────────────────────────────
router.post(
  '/signin',
  [
    body('loginId').trim().notEmpty().withMessage('Login ID or email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const { loginId, password } = req.body
    try {
      // Accept login_id OR email
      const [[user]] = await pool.query(
        `SELECT u.id, u.login_id, u.email, u.password_hash, u.role,
                u.company_id, u.first_login,
                e.id AS employee_id, e.name, e.status, e.avatar_url
         FROM users u
         LEFT JOIN employees e ON e.user_id = u.id
         WHERE u.login_id = ? OR u.email = ?`,
        [loginId, loginId]
      )

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' })
      }

      const match = await bcrypt.compare(password, user.password_hash)
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials.' })
      }

      const token = signToken({
        id: user.id,
        role: user.role,
        companyId: user.company_id,
        employeeId: user.employee_id
      })

      res.json({
        token,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          name: user.name,
          email: user.email,
          loginId: user.login_id,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatar_url,
          firstLogin: Boolean(user.first_login)
        }
      })
    } catch (err) {
      console.error('signin error:', err)
      res.status(500).json({ error: 'Sign in failed. Please try again.' })
    }
  }
)

// ─── POST /auth/change-password ─────────────────────────────────────────────
// Required for first-login password change (SKILL.md §1)
import auth from '../middleware/auth.js'
router.post(
  '/change-password',
  auth,
  [
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    try {
      const hash = await bcrypt.hash(req.body.newPassword, Number(process.env.BCRYPT_ROUNDS) || 10)
      await pool.query(
        'UPDATE users SET password_hash = ?, first_login = 0 WHERE id = ?',
        [hash, req.user.id]
      )
      res.json({ message: 'Password changed.' })
    } catch (err) {
      console.error('change-password error:', err)
      res.status(500).json({ error: 'Failed to change password.' })
    }
  }
)

// ─── Helpers ────────────────────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  })
}

async function seedLeaveAllocations(conn, employeeId) {
  const [types] = await conn.query('SELECT id FROM leave_types')
  for (const lt of types) {
    // Default allocations: 24 Paid, 7 Sick, 0 Unpaid
    const defaults = { 1: 24, 2: 7, 3: 0 }
    await conn.query(
      `INSERT IGNORE INTO leave_allocations (employee_id, leave_type_id, total_days)
       VALUES (?, ?, ?)`,
      [employeeId, lt.id, defaults[lt.id] ?? 0]
    )
  }
}

export default router
