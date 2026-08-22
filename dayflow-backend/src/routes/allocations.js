import { Router } from 'express'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()

// ─── GET /timeoff/allocations — admin only ────────────────────────────────────
// § 7 — per-employee leave balances for the Allocation sub-tab
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id AS employeeId, e.name,
              lt.name AS leaveType,
              la.total_days AS totalDays,
              la.used_days AS usedDays,
              (la.total_days - la.used_days) AS remaining
       FROM leave_allocations la
       JOIN employees e ON e.id = la.employee_id
       JOIN leave_types lt ON lt.id = la.leave_type_id
       JOIN users u ON u.id = e.user_id
       WHERE u.company_id = ?
       ORDER BY e.name, lt.name`,
      [req.user.companyId]
    )

    // Group by employee for the frontend table shape
    const grouped = {}
    for (const row of rows) {
      if (!grouped[row.employeeId]) {
        grouped[row.employeeId] = { id: row.employeeId, name: row.name, allocations: {} }
      }
      grouped[row.employeeId].allocations[row.leaveType] = {
        totalDays: row.totalDays,
        usedDays: row.usedDays,
        remaining: row.remaining
      }
    }
    res.json(Object.values(grouped))
  } catch (err) {
    console.error('GET /timeoff/allocations:', err)
    res.status(500).json({ error: 'Failed to fetch allocations.' })
  }
})

// ─── PUT /timeoff/allocations/:employeeId — admin sets leave balance ──────────
import { body, validationResult } from 'express-validator'
router.put(
  '/:employeeId',
  auth,
  requireRole('admin'),
  [
    body('leaveType').notEmpty().withMessage('leaveType is required.'),
    body('totalDays').isInt({ min: 0 }).withMessage('totalDays must be a non-negative integer.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const { leaveType, totalDays } = req.body
    try {
      const [[lt]] = await pool.query('SELECT id FROM leave_types WHERE name = ?', [leaveType])
      if (!lt) return res.status(400).json({ error: 'Invalid leave type.' })

      await pool.query(
        `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE total_days = VALUES(total_days)`,
        [req.params.employeeId, lt.id, totalDays]
      )
      res.json({ message: 'Allocation updated.' })
    } catch (err) {
      console.error('PUT /timeoff/allocations:', err)
      res.status(500).json({ error: 'Failed to update allocation.' })
    }
  }
)

export default router
