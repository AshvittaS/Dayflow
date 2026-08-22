/**
 * seed.js — Populates the DB with realistic demo data for the hackathon demo.
 * Run AFTER schema: node src/seed.js
 * Safe to re-run — uses INSERT IGNORE / ON DUPLICATE KEY UPDATE.
 */
import 'dotenv/config'
import bcrypt from 'bcrypt'
import pool from './db.js'
import { generateLoginId } from './utils/loginId.js'

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10

async function seed() {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // ── 1. Company ──────────────────────────────────────────────────────────
    const [companyRes] = await conn.query(
      `INSERT INTO companies (name, code) VALUES ('Dayflow Inc.', 'DF')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`)
    const companyId = companyRes.insertId || (await getCompanyId(conn, 'DF'))

    // ── 2. Leave Types (exactly 3 per SKILL.md §7) ─────────────────────────
    const leaveNames = ['Paid Time Off', 'Sick Leave', 'Unpaid Leave']
    for (const name of leaveNames) {
      await conn.query('INSERT IGNORE INTO leave_types (name) VALUES (?)', [name])
    }
    const [ltRows] = await conn.query('SELECT id, name FROM leave_types')
    const ltMap = Object.fromEntries(ltRows.map(r => [r.name, r.id]))

    // ── 3. Users + Employees ────────────────────────────────────────────────
    const people = [
      {
        firstName: 'Jamie',  lastName: 'Doe',   email: 'jamie.doe@dayflow.dev',
        role: 'admin', department: 'Administration', mobile: '+91 90000 00000',
        serial: 1, about: 'HR lead and system admin for Dayflow.',
        skills: ['HR Management', 'Payroll', 'Compliance'],
        certifications: ['SHRM-CP', 'PHR Certification'],
        interests: ['Team Building', 'Process Automation']
      },
      {
        firstName: 'Alex',   lastName: 'Kumar',  email: 'alex.kumar@dayflow.dev',
        role: 'employee', department: 'Design', mobile: '+91 90000 00001',
        serial: 2, about: 'Product designer passionate about clean interfaces.',
        skills: ['Figma', 'UI/UX', 'Prototyping'],
        certifications: ['Google UX Design Certificate'],
        interests: ['Typography', 'Motion Design']
      },
      {
        firstName: 'Priya',  lastName: 'Nair',   email: 'priya.nair@dayflow.dev',
        role: 'employee', department: 'HR', mobile: '+91 90000 00002',
        serial: 3, about: 'HR specialist focused on people operations.',
        skills: ['Recruiting', 'HRIS', 'Onboarding'],
        certifications: ['HRCI PHR'],
        interests: ['Employee Wellness', 'Learning & Development']
      },
      {
        firstName: 'Sam',    lastName: 'Lee',    email: 'sam.lee@dayflow.dev',
        role: 'employee', department: 'Engineering', mobile: '+91 90000 00003',
        serial: 4, about: 'Full-stack engineer, Node.js enthusiast.',
        skills: ['Node.js', 'React', 'MySQL'],
        certifications: ['AWS Certified Developer'],
        interests: ['Open Source', 'DevOps']
      },
      {
        firstName: 'Meera',  lastName: 'Iyer',   email: 'meera.iyer@dayflow.dev',
        role: 'employee', department: 'Sales', mobile: '+91 90000 00004',
        serial: 5, about: 'Sales manager with a track record of exceeding targets.',
        skills: ['CRM', 'Negotiation', 'Market Research'],
        certifications: ['Salesforce Certified'],
        interests: ['Public Speaking', 'Entrepreneurship']
      },
      {
        firstName: 'Dev',    lastName: 'Patel',  email: 'dev.patel@dayflow.dev',
        role: 'employee', department: 'Engineering', mobile: '+91 90000 00005',
        serial: 6, about: 'Backend engineer, database performance specialist.',
        skills: ['Python', 'PostgreSQL', 'Redis'],
        certifications: ['Google Cloud Associate'],
        interests: ['System Design', 'Competitive Programming']
      }
    ]

    const statusMap = { 1: 'present', 2: 'leave', 3: 'absent', 4: 'present', 5: 'present', 6: 'absent' }
    const empIds = {}

    for (let i = 0; i < people.length; i++) {
      const p = people[i]
      const loginId = generateLoginId('DF', p.firstName, p.lastName, 2026, p.serial)
      const hash = await bcrypt.hash('Password@123', ROUNDS)

      const [ur] = await conn.query(
        `INSERT INTO users (company_id, login_id, email, password_hash, role, first_login)
         VALUES (?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE login_id = VALUES(login_id)`,
        [companyId, loginId, p.email, hash, p.role]
      )
      const userId = ur.insertId || (await getUserId(conn, p.email))

      const [er] = await conn.query(
        `INSERT INTO employees
           (user_id, name, department, mobile, about, skills, certifications, interests, status, join_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '2026-01-15')
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), department = VALUES(department), status = VALUES(status)`,
        [
          userId, `${p.firstName} ${p.lastName}`, p.department, p.mobile,
          p.about, JSON.stringify(p.skills),
          JSON.stringify(p.certifications), JSON.stringify(p.interests),
          statusMap[i + 1]
        ]
      )
      empIds[p.serial] = er.insertId || (await getEmpId(conn, userId))
    }

    // ── 4. Leave Allocations ─────────────────────────────────────────────────
    const defaultAlloc = {
      'Paid Time Off': [24, 24, 20, 24, 24, 18],
      'Sick Leave':    [7,  7,  7,  7,  5,  7],
      'Unpaid Leave':  [0,  0,  2,  0,  0,  3]
    }
    for (let i = 1; i <= 6; i++) {
      const empId = empIds[i]
      for (const [type, vals] of Object.entries(defaultAlloc)) {
        await conn.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE total_days = VALUES(total_days)`,
          [empId, ltMap[type], vals[i - 1]]
        )
      }
    }

    // ── 5. Attendance Records (Aug 2026 for Jamie — emp serial 1) ───────────
    const attendanceData = [
      ['2026-08-01', '09:15', '18:30', '09:15', '01:15'],
      ['2026-08-04', '09:32', '18:41', '09:09', '01:09'],
      ['2026-08-05', '10:02', '18:05', '08:03', '00:03'],
      ['2026-08-06', '09:00', '18:00', '09:00', '01:00'],
      ['2026-08-07', '09:45', '17:30', '07:45', '00:00'],
      ['2026-08-08', '09:10', '18:20', '09:10', '01:10'],
      ['2026-08-11', '09:30', '18:30', '09:00', '01:00'],
      ['2026-08-12', '10:00', '19:00', '09:00', '01:00'],
      ['2026-08-13', '09:05', '17:50', '08:45', '00:45'],
      ['2026-08-14', '09:20', '18:10', '08:50', '00:50'],
      ['2026-08-18', '09:00', '18:00', '09:00', '01:00'],
      ['2026-08-19', '09:30', '18:30', '09:00', '01:00'],
      ['2026-08-20', '09:32', '18:41', '09:09', '01:09'],
      ['2026-08-21', '10:02', '19:05', '09:03', '01:03']
    ]
    const jamieEmpId = empIds[1]
    for (const [date, ci, co, wh, eh] of attendanceData) {
      await conn.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, work_hours, extra_hours)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE check_in = VALUES(check_in)`,
        [jamieEmpId, date, ci, co, wh, eh]
      )
    }

    // Alex (serial 2) on leave Aug 15–16
    const alexEmpId = empIds[2]
    await conn.query(
      `INSERT IGNORE INTO attendance (employee_id, date, check_in, check_out, work_hours, extra_hours)
       VALUES (?, '2026-08-13', '09:00', '18:00', '09:00', '01:00')`,
      [alexEmpId]
    )

    // ── 6. Time Off Requests ─────────────────────────────────────────────────
    const requests = [
      { empSerial: 1, type: 'Paid Time Off',  start: '2026-08-26', end: '2026-08-26', days: 1, status: 'Pending',  file: null },
      { empSerial: 2, type: 'Sick Leave',      start: '2026-08-15', end: '2026-08-16', days: 2, status: 'Approved', file: null },
      { empSerial: 3, type: 'Unpaid Leave',    start: '2026-08-10', end: '2026-08-10', days: 1, status: 'Rejected', file: null },
      { empSerial: 4, type: 'Paid Time Off',   start: '2026-09-01', end: '2026-09-05', days: 5, status: 'Pending',  file: null }
    ]
    for (const r of requests) {
      await conn.query(
        `INSERT IGNORE INTO time_off_requests
           (employee_id, leave_type_id, start_date, end_date, days_requested, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [empIds[r.empSerial], ltMap[r.type], r.start, r.end, r.days, r.status]
      )
    }
    // Deduct used_days for Approved request (Alex, Sick Leave, 2 days)
    await conn.query(
      `UPDATE leave_allocations SET used_days = 2
       WHERE employee_id = ? AND leave_type_id = ?`,
      [alexEmpId, ltMap['Sick Leave']]
    )

    // ── 7. Salary Structure (Jamie — admin) ──────────────────────────────────
    const [ssRes] = await conn.query(
      `INSERT INTO salary_structures
         (employee_id, wage_type, salary_type, month_wage,
          working_days_per_week, break_time_hrs,
          pf_employee_pct, pf_employer_pct, professional_tax)
       VALUES (?, 'Monthly', 'Fixed', 50000, 5, 1, 12, 12, 200)
       ON DUPLICATE KEY UPDATE month_wage = VALUES(month_wage)`,
      [jamieEmpId]
    )
    const [[{ id: ssId }]] = await conn.query(
      'SELECT id FROM salary_structures WHERE employee_id = ?', [jamieEmpId]
    )
    const components = [
      { label: 'Basic Salary',           percent: 60, sort: 0 },
      { label: 'House Rent Allowance',   percent: 50, sort: 1 },
      { label: 'Standard Allowance',     percent: 8,  sort: 2 },
      { label: 'Performance Bonus',      percent: 6,  sort: 3 },
      { label: 'Leave Travel Allowance', percent: 4,  sort: 4 },
      { label: 'Fixed Allowance',        percent: 2,  sort: 5 }
    ]
    await conn.query('DELETE FROM salary_components WHERE salary_structure_id = ?', [ssId])
    for (const c of components) {
      const amount = parseFloat(((c.percent / 100) * 50000).toFixed(2))
      await conn.query(
        `INSERT INTO salary_components (salary_structure_id, label, percent, amount, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [ssId, c.label, c.percent, amount, c.sort]
      )
    }

    await conn.commit()
    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('  Admin login:')
    console.log('    Login ID : DF26JD0001')
    console.log('    Email    : jamie.doe@dayflow.dev')
    console.log('    Password : Password@123')
    console.log('')
    console.log('  Employee login (any):')
    console.log('    Login ID : DF26AK0002  (Alex Kumar)')
    console.log('    Password : Password@123')
    console.log('')
  } catch (err) {
    await conn.rollback()
    console.error('❌ Seed failed:', err)
    process.exit(1)
  } finally {
    conn.release()
    process.exit(0)
  }
}

async function getCompanyId(conn, code) {
  const [[r]] = await conn.query('SELECT id FROM companies WHERE code = ?', [code])
  return r.id
}
async function getUserId(conn, email) {
  const [[r]] = await conn.query('SELECT id FROM users WHERE email = ?', [email])
  return r.id
}
async function getEmpId(conn, userId) {
  const [[r]] = await conn.query('SELECT id FROM employees WHERE user_id = ?', [userId])
  return r.id
}

seed()
