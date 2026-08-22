import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

const TIDB_CONFIG = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'kSH4qHJFTjAigod.root',
  password: 'GdJegd9ktj1GKo0U',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
}

async function setupCloudDatabase() {
  console.log('1. Connecting to TiDB Cloud instance...')
  const rootConn = await mysql.createConnection(TIDB_CONFIG)
  await rootConn.query('CREATE DATABASE IF NOT EXISTS dayflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
  await rootConn.end()
  console.log('✅ Database `dayflow` created.')

  console.log('2. Connecting to `dayflow` database...')
  const conn = await mysql.createConnection({
    ...TIDB_CONFIG,
    database: 'dayflow',
    multipleStatements: true
  })

  console.log('3. Applying schema.sql...')
  const schemaSql = fs.readFileSync(path.resolve('src/schema.sql'), 'utf-8')
  await conn.query(schemaSql)
  console.log('✅ Schema tables created successfully.')

  console.log('4. Seeding initial test data into TiDB Cloud...')
  // Check if companies exist
  const [[comp]] = await conn.query('SELECT id FROM companies LIMIT 1')
  if (!comp) {
    // Seed Company
    const [cRes] = await conn.query("INSERT INTO companies (name, code) VALUES ('Dayflow Corp', 'DF')")
    const companyId = cRes.insertId

    // Seed Leave Types
    await conn.query("INSERT IGNORE INTO leave_types (id, name) VALUES (1, 'Paid Time Off'), (2, 'Sick Leave'), (3, 'Unpaid Leave')")

    // Default password: Password@123
    const passwordHash = await bcrypt.hash('Password@123', 10)

    // Admin user: Jamie Doe
    const [u1] = await conn.query(
      "INSERT INTO users (company_id, login_id, email, password_hash, role, first_login) VALUES (?, 'DF26JD0001', 'jamie.doe@dayflow.dev', ?, 'admin', 0)",
      [companyId, passwordHash]
    )
    const [e1] = await conn.query(
      "INSERT INTO employees (user_id, name, department, title, location, mobile, about, status, join_date) VALUES (?, 'Jamie Doe', 'Administration', 'HR Director', 'Bengaluru', '+91 90000 00000', 'HR leader with 10+ years scaling people ops.', 'present', '2022-01-15')",
      [u1.insertId]
    )

    // Employee user: Alex Kumar
    const [u2] = await conn.query(
      "INSERT INTO users (company_id, login_id, email, password_hash, role, first_login) VALUES (?, 'DF26AK0002', 'alex.kumar@dayflow.dev', ?, 'employee', 0)",
      [companyId, passwordHash]
    )
    const [e2] = await conn.query(
      "INSERT INTO employees (user_id, name, department, title, location, mobile, about, status, join_date) VALUES (?, 'Alex Kumar', 'Engineering', 'Senior Frontend Engineer', 'Bengaluru', '+91 91111 11111', 'React and design systems enthusiast.', 'present', '2023-03-01')",
      [u2.insertId]
    )

    // Additional seed employees
    const staff = [
      { name: 'Priya Sharma', email: 'priya.sharma@dayflow.dev', loginId: 'DF26PS0003', dept: 'Design', title: 'Product Designer', wage: 75000 },
      { name: 'Marcus Vance', email: 'marcus.vance@dayflow.dev', loginId: 'DF26MV0004', dept: 'Engineering', title: 'Backend Architect', wage: 95000 },
      { name: 'Sarah Chen', email: 'sarah.chen@dayflow.dev', loginId: 'DF26SC0005', dept: 'Sales', title: 'Account Executive', wage: 65000 },
      { name: 'David Miller', email: 'david.miller@dayflow.dev', loginId: 'DF26DM0006', dept: 'HR', title: 'HR Coordinator', wage: 55000 }
    ]

    const allEmps = [
      { id: e1.insertId, wage: 120000 },
      { id: e2.insertId, wage: 85000 }
    ]

    for (const s of staff) {
      const [u] = await conn.query(
        "INSERT INTO users (company_id, login_id, email, password_hash, role, first_login) VALUES (?, ?, ?, ?, 'employee', 0)",
        [companyId, s.loginId, s.email, passwordHash]
      )
      const [e] = await conn.query(
        "INSERT INTO employees (user_id, name, department, title, location, mobile, about, status, join_date) VALUES (?, ?, ?, ?, 'Bengaluru', '+91 98765 00000', 'Dedicated Dayflow team member.', 'absent', CURDATE())",
        [u.insertId, s.name, s.dept, s.title]
      )
      allEmps.push({ id: e.insertId, wage: s.wage })
    }

    // Seed salary structures and allocations
    for (const emp of allEmps) {
      const [sRes] = await conn.query(
        "INSERT INTO salary_structures (employee_id, wage_type, salary_type, month_wage, working_days_per_week, break_time_hrs, pf_employee_pct, pf_employer_pct, professional_tax) VALUES (?, 'Fixed', 'Monthly', ?, 5, 1, 12.00, 12.00, 200.00)",
        [emp.id, emp.wage]
      )
      const sid = sRes.insertId
      await conn.query("INSERT INTO salary_components (salary_structure_id, label, percent, amount) VALUES (?, 'Basic Salary', 50, ?), (?, 'House Rent Allowance', 25, ?), (?, 'Special Allowance', 15, ?), (?, 'Standard Allowance', 10, ?)", [
        sid, emp.wage * 0.5, sid, emp.wage * 0.25, sid, emp.wage * 0.15, sid, emp.wage * 0.1
      ])

      await conn.query("INSERT IGNORE INTO leave_allocations (employee_id, leave_type_id, total_days, used_days) VALUES (?, 1, 24, 2), (?, 2, 7, 0), (?, 3, 0, 0)", [emp.id, emp.id, emp.id])
    }

    // Seed sample pending leave request
    await conn.query(
      "INSERT INTO time_off_requests (employee_id, leave_type_id, start_date, end_date, days_requested, status) VALUES (?, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 3, 'Pending')",
      [e2.insertId]
    )

    console.log('✅ All employees, salary structures, leave quotas & sample requests seeded!')
  } else {
    console.log('Database already populated.')
  }

  await conn.end()
  console.log('🎉 TiDB Cloud Database Setup & Seeding Complete!')
}

setupCloudDatabase().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
