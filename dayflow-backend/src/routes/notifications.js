import { Router } from 'express'
import pool from '../db.js'
import auth from '../middleware/auth.js'

const router = Router()

/**
 * Helper to emit a notification into the DB
 */
export async function createNotification(connOrPool, {
  companyId,
  userId = null,
  roleTarget = null,
  type = 'system',
  title,
  message,
  link = null
}) {
  try {
    const executor = connOrPool || pool
    await executor.query(
      `INSERT INTO notifications (company_id, user_id, role_target, type, title, message, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyId, userId, roleTarget, type, title, message, link]
    )
  } catch (err) {
    console.error('Error creating notification:', err)
  }
}

// ─── GET /notifications ──────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'hr_officer'
    
    // Auto-seed initial contextual notifications if empty for company
    const [[countRow]] = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE company_id = ?',
      [req.user.companyId]
    )
    if (countRow.total === 0) {
      await seedInitialNotifications(req.user.companyId, req.user.id)
    }

    // Fetch notifications tailored for this user:
    // (user_id = current user) OR (user_id IS NULL AND (role_target IS NULL OR role_target = user's role))
    const [rows] = await pool.query(
      `SELECT id, type, title, message, link, is_read AS isRead, 
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM notifications
       WHERE company_id = ?
         AND (user_id = ? OR (user_id IS NULL AND (role_target IS NULL OR role_target = ? OR (role_target = 'admin' AND ? = 1))))
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.user.companyId, req.user.id, req.user.role, isAdmin ? 1 : 0]
    )

    res.json(rows)
  } catch (err) {
    console.error('GET /notifications:', err)
    res.status(500).json({ error: 'Failed to fetch notifications.' })
  }
})

// ─── PUT /notifications/read-all ─────────────────────────────────────────────
router.put('/read-all', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'hr_officer'
    await pool.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE company_id = ?
         AND (user_id = ? OR (user_id IS NULL AND (role_target IS NULL OR role_target = ? OR (role_target = 'admin' AND ? = 1))))`,
      [req.user.companyId, req.user.id, req.user.role, isAdmin ? 1 : 0]
    )
    res.json({ message: 'All notifications marked as read.' })
  } catch (err) {
    console.error('PUT /notifications/read-all:', err)
    res.status(500).json({ error: 'Failed to mark notifications as read.' })
  }
})

// ─── PUT /notifications/:id/read ─────────────────────────────────────────────
router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.companyId]
    )
    res.json({ message: 'Notification marked as read.' })
  } catch (err) {
    console.error('PUT /notifications/:id/read:', err)
    res.status(500).json({ error: 'Failed to update notification.' })
  }
})

// ─── Helper to seed realistic starting notifications ─────────────────────────
async function seedInitialNotifications(companyId, adminUserId) {
  const initialItems = [
    {
      companyId,
      userId: null,
      roleTarget: 'admin',
      type: 'leave',
      title: 'Leave Request Pending Review',
      message: 'Alex Kumar requested 2 days of Casual Leave for next week.',
      link: '/timeoff'
    },
    {
      companyId,
      userId: null,
      roleTarget: null,
      type: 'attendance',
      title: 'Workday Attendance Active',
      message: 'Live attendance and team pulse cadence is active for today.',
      link: '/attendance'
    },
    {
      companyId,
      userId: null,
      roleTarget: 'admin',
      type: 'payroll',
      title: 'Monthly Salary Run Rate',
      message: 'Monthly wage structures and statutory deductions are updated.',
      link: '/admin'
    },
    {
      companyId,
      userId: null,
      roleTarget: null,
      type: 'employee',
      title: 'Dayflow HR Workspace Live',
      message: 'Welcome to Dayflow Human Resource Management System.',
      link: '/employees'
    }
  ]

  for (const item of initialItems) {
    await createNotification(pool, item)
  }
}

export default router
