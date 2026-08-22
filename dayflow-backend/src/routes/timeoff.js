import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'
import { createNotification } from './notifications.js'

const router = Router()

// File uploads for sick leave certificates
const uploadDir = path.resolve('uploads/timeoff')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png']
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error('Only PDF, JPG, PNG files are allowed.'))
  }
})

// Allowed leave types — exactly 3 per SKILL.md §7
const ALLOWED_TYPES = ['Paid Time Off', 'Sick Leave', 'Unpaid Leave']

// ─── GET /timeoff ─────────────────────────────────────────────────────────────
// Employee: own requests. Admin: all requests, optional ?status filter
router.get('/', auth, async (req, res) => {
  try {
    let query, params
    const isAdmin = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'hr_officer'
    if (isAdmin) {
      query = `
        SELECT tor.id, e.id AS employeeId, e.name AS employee, e.department, 
               e.mobile, u.email, u.login_id AS loginId,
               lt.name AS type,
               DATE_FORMAT(tor.start_date, '%Y-%m-%d') AS startDate, 
               DATE_FORMAT(tor.end_date, '%Y-%m-%d') AS endDate,
               tor.days_requested AS daysRequested,
               tor.status, tor.attachment_url AS attachmentUrl,
               tor.created_at AS createdAt
        FROM time_off_requests tor
        JOIN employees e ON e.id = tor.employee_id
        JOIN leave_types lt ON lt.id = tor.leave_type_id
        JOIN users u ON u.id = e.user_id
        WHERE u.company_id = ?
        ${req.query.status ? 'AND tor.status = ?' : ''}
        ORDER BY tor.created_at DESC`
      params = req.query.status
        ? [req.user.companyId, req.query.status]
        : [req.user.companyId]
    } else {
      query = `
        SELECT tor.id, lt.name AS type,
               DATE_FORMAT(tor.start_date, '%Y-%m-%d') AS startDate, 
               DATE_FORMAT(tor.end_date, '%Y-%m-%d') AS endDate,
               tor.days_requested AS daysRequested,
               tor.status, tor.attachment_url AS attachmentUrl,
               tor.created_at AS createdAt
        FROM time_off_requests tor
        JOIN leave_types lt ON lt.id = tor.leave_type_id
        WHERE tor.employee_id = ?
        ORDER BY tor.created_at DESC`
      params = [req.user.employeeId]
    }
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error('GET /timeoff:', err)
    res.status(500).json({ error: 'Failed to fetch time off requests.' })
  }
})

// ─── GET /timeoff/:id ────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const [[tor]] = await pool.query(
      `SELECT tor.id, e.id AS employeeId, e.name AS employee, e.department, 
              e.mobile, u.email, u.login_id AS loginId,
              lt.name AS type,
              DATE_FORMAT(tor.start_date, '%Y-%m-%d') AS startDate, 
              DATE_FORMAT(tor.end_date, '%Y-%m-%d') AS endDate,
              tor.days_requested AS daysRequested,
              tor.status, tor.attachment_url AS attachmentUrl,
              tor.created_at AS createdAt
       FROM time_off_requests tor
       JOIN employees e ON e.id = tor.employee_id
       JOIN leave_types lt ON lt.id = tor.leave_type_id
       JOIN users u ON u.id = e.user_id
       WHERE tor.id = ? AND u.company_id = ?`,
      [req.params.id, req.user.companyId]
    )
    if (!tor) return res.status(404).json({ error: 'Request not found.' })

    // Fetch employee leave allocations for context
    const [allocRows] = await pool.query(
      `SELECT lt.name, la.total_days AS totalDays, la.used_days AS usedDays,
              (la.total_days - la.used_days) AS remaining
       FROM leave_allocations la
       JOIN leave_types lt ON lt.id = la.leave_type_id
       WHERE la.employee_id = ?`,
      [tor.employeeId]
    )
    tor.allocations = allocRows

    res.json(tor)
  } catch (err) {
    console.error('GET /timeoff/:id:', err)
    res.status(500).json({ error: 'Failed to fetch request details.' })
  }
})

// ─── POST /timeoff — employee submits a request ───────────────────────────────
router.post(
  '/',
  auth,
  upload.single('attachment'),
  [
    body('type')
      .isIn(ALLOWED_TYPES)
      .withMessage(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`),
    body('startDate').isDate().withMessage('Valid start date is required.'),
    body('endDate')
      .isDate()
      .withMessage('Valid end date is required.')
      .custom((end, { req }) => {
        if (new Date(end) < new Date(req.body.startDate)) {
          throw new Error('End date must be on or after start date.')
        }
        return true
      }),
    body('daysRequested')
      .isInt({ min: 1 })
      .withMessage('Days requested must be at least 1.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const { type, startDate, endDate, daysRequested } = req.body

    // § 7: attachment required for Sick Leave
    if (type === 'Sick Leave' && !req.file) {
      return res.status(422).json({
        errors: [{ msg: 'A sick leave certificate attachment is required for Sick Leave.' }]
      })
    }

    try {
      const [[lt]] = await pool.query('SELECT id FROM leave_types WHERE name = ?', [type])
      if (!lt) return res.status(400).json({ error: 'Invalid leave type.' })

      // Check balance
      const [[alloc]] = await pool.query(
        `SELECT total_days - used_days AS remaining
         FROM leave_allocations WHERE employee_id = ? AND leave_type_id = ?`,
        [req.user.employeeId, lt.id]
      )
      if (alloc && alloc.remaining < Number(daysRequested) && type !== 'Unpaid Leave') {
        return res.status(400).json({
          error: `Insufficient balance. You have ${alloc?.remaining ?? 0} days remaining.`
        })
      }

      const attachmentUrl = req.file ? `/uploads/timeoff/${req.file.filename}` : null

      const [result] = await pool.query(
        `INSERT INTO time_off_requests
           (employee_id, leave_type_id, start_date, end_date, days_requested, attachment_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.employeeId, lt.id, startDate, endDate, daysRequested, attachmentUrl]
      )

      // Notify company admins
      const [[empRow]] = await pool.query('SELECT name FROM employees WHERE id = ?', [req.user.employeeId])
      await createNotification(pool, {
        companyId: req.user.companyId,
        roleTarget: 'admin',
        type: 'leave',
        title: 'New Leave Request Submitted',
        message: `${empRow?.name || 'An employee'} requested ${daysRequested} day(s) of ${type} (${startDate} to ${endDate}).`,
        link: '/timeoff'
      })

      res.status(201).json({ message: 'Request submitted.', id: result.insertId })
    } catch (err) {
      console.error('POST /timeoff:', err)
      res.status(500).json({ error: 'Failed to submit request.' })
    }
  }
)

// ─── PUT /timeoff/:id/status — admin approve/reject ─────────────────────────
router.put(
  '/:id/status',
  auth,
  requireRole(['admin', 'hr', 'hr_officer']),
  [
    body('status')
      .isIn(['Approved', 'Rejected'])
      .withMessage('Status must be Approved or Rejected.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const requestId = Number(req.params.id)
    const { status } = req.body
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [[tor]] = await conn.query(
        `SELECT tor.*, lt.name AS leaveType, e.user_id AS empUserId, e.name AS empName
         FROM time_off_requests tor
         JOIN leave_types lt ON lt.id = tor.leave_type_id
         JOIN employees e ON e.id = tor.employee_id
         WHERE tor.id = ?`,
        [requestId]
      )
      if (!tor) {
        await conn.rollback()
        return res.status(404).json({ error: 'Request not found.' })
      }
      if (tor.status !== 'Pending') {
        await conn.rollback()
        return res.status(409).json({ error: 'Request has already been reviewed.' })
      }

      await conn.query(
        'UPDATE time_off_requests SET status = ?, reviewed_by = ? WHERE id = ?',
        [status, req.user.id, requestId]
      )

      if (status === 'Approved') {
        // Deduct from leave allocation
        await conn.query(
          `UPDATE leave_allocations
           SET used_days = used_days + ?
           WHERE employee_id = ? AND leave_type_id = ?`,
          [tor.days_requested, tor.employee_id, tor.leave_type_id]
        )
        // If leave range includes today, update employee status → 'leave'
        const today = new Date().toISOString().slice(0, 10)
        if (tor.start_date <= today && today <= tor.end_date) {
          await conn.query(
            "UPDATE employees SET status = 'leave' WHERE id = ?",
            [tor.employee_id]
          )
        }
      }

      // Notify the employee
      if (tor.empUserId) {
        await createNotification(conn, {
          companyId: req.user.companyId,
          userId: tor.empUserId,
          type: 'leave',
          title: `Leave Request ${status}`,
          message: `Your ${tor.leaveType} request for ${tor.days_requested} day(s) was ${status.toLowerCase()} by HR.`,
          link: '/timeoff'
        })
      }

      await conn.commit()
      res.json({ message: `Request ${status.toLowerCase()}.` })
    } catch (err) {
      await conn.rollback()
      console.error('PUT /timeoff/:id/status:', err)
      res.status(500).json({ error: 'Failed to update status.' })
    } finally {
      conn.release()
    }
  }
)

export default router
