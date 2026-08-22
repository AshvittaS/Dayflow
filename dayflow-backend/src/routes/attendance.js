import { Router } from 'express'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()

// ─── POST /attendance/checkin ────────────────────────────────────────────────
// § 6 — creates attendance record for today; updates employee status → 'present'
router.post('/checkin', auth, async (req, res) => {
  const empId = req.user.employeeId
  const today = todayDate()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Prevent double check-in
    const [[existing]] = await conn.query(
      'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
      [empId, today]
    )
    if (existing?.check_in && !existing?.check_out) {
      await conn.rollback()
      return res.status(409).json({ error: 'Already checked in today.' })
    }
    if (existing?.check_out) {
      await conn.rollback()
      return res.status(409).json({ error: 'Already completed attendance for today.' })
    }

    const now = currentTime()
    await conn.query(
      `INSERT INTO attendance (employee_id, date, check_in)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in)`,
      [empId, today, now]
    )

    // Live status update § 3
    await conn.query(
      "UPDATE employees SET status = 'present' WHERE id = ?", [empId]
    )

    await conn.commit()
    res.json({ message: 'Checked in.', checkIn: now, date: today })
  } catch (err) {
    await conn.rollback()
    console.error('POST /checkin:', err)
    res.status(500).json({ error: 'Check-in failed.' })
  } finally {
    conn.release()
  }
})

// ─── POST /attendance/checkout ───────────────────────────────────────────────
router.post('/checkout', auth, async (req, res) => {
  const empId = req.user.employeeId
  const today = todayDate()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [[record]] = await conn.query(
      'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
      [empId, today]
    )
    if (!record?.check_in) {
      await conn.rollback()
      return res.status(400).json({ error: 'You have not checked in today.' })
    }
    if (record.check_out) {
      await conn.rollback()
      return res.status(409).json({ error: 'Already checked out today.' })
    }

    const now = currentTime()
    const { workHours, extraHours } = computeHours(record.check_in, now)

    await conn.query(
      `UPDATE attendance SET check_out = ?, work_hours = ?, extra_hours = ?
       WHERE employee_id = ? AND date = ?`,
      [now, workHours, extraHours, empId, today]
    )

    await conn.query(
      "UPDATE employees SET status = 'absent' WHERE id = ?", [empId]
    )

    await conn.commit()
    res.json({ message: 'Checked out.', checkOut: now, workHours, extraHours })
  } catch (err) {
    await conn.rollback()
    console.error('POST /checkout:', err)
    res.status(500).json({ error: 'Check-out failed.' })
  } finally {
    conn.release()
  }
})

// ─── GET /attendance ─────────────────────────────────────────────────────────
// Employee: own records for ?month=YYYY-MM (defaults to current month)
// Admin: accepts ?employeeId=X&month=YYYY-MM
// § 6 — Columns: Day/Date, Check In, Check Out, Work Hours, Extra Hours
router.get('/', auth, async (req, res) => {
  try {
    const month = req.query.month || monthStr(new Date())
    const [year, mon] = month.split('-')

    let empId = req.user.employeeId
    if (req.user.role === 'admin' && req.query.employeeId) {
      empId = Number(req.query.employeeId)
    }

    const [rows] = await pool.query(
      `SELECT date, check_in AS checkIn, check_out AS checkOut,
              work_hours AS workHours, extra_hours AS extraHours
       FROM attendance
       WHERE employee_id = ?
         AND YEAR(date) = ? AND MONTH(date) = ?
       ORDER BY date`,
      [empId, year, mon]
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /attendance:', err)
    res.status(500).json({ error: 'Failed to fetch attendance.' })
  }
})

// ─── GET /attendance/summary ─────────────────────────────────────────────────
// Returns daysPresent / totalWorkingDays for the requested month
router.get('/summary', auth, async (req, res) => {
  try {
    const month = req.query.month || monthStr(new Date())
    const [year, mon] = month.split('-')
    let empId = req.user.employeeId
    if (req.user.role === 'admin' && req.query.employeeId) empId = Number(req.query.employeeId)

    const [[{ daysPresent }]] = await pool.query(
      `SELECT COUNT(*) AS daysPresent FROM attendance
       WHERE employee_id = ? AND YEAR(date) = ? AND MONTH(date) = ? AND check_in IS NOT NULL`,
      [empId, year, mon]
    )
    // Working days: Mon–Fri in month (placeholder calculation)
    const totalWorkingDays = countWeekdays(Number(year), Number(mon) - 1)
    res.json({ daysPresent, totalWorkingDays, leavesTaken: 0 })
  } catch (err) {
    console.error('GET /attendance/summary:', err)
    res.status(500).json({ error: 'Failed to fetch summary.' })
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5) // HH:MM
}

function monthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Computes work_hours and extra_hours (above 8h standard day) from HH:MM strings */
function computeHours(checkIn, checkOut) {
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const totalMins = toMins(checkOut) - toMins(checkIn)
  const standardMins = 8 * 60

  const fmt = (mins) => {
    const h = Math.floor(Math.abs(mins) / 60)
    const m = Math.abs(mins) % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return {
    workHours: fmt(totalMins),
    extraHours: totalMins > standardMins ? fmt(totalMins - standardMins) : '00:00'
  }
}

function countWeekdays(year, month) {
  let count = 0
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

export default router
