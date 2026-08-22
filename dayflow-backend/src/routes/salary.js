import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()

// SKILL.md §5 — Salary Info is admin-only. The guard is enforced here.
// SKILL.md §8 — Employee can never see the Salary Info tab.

// ─── GET /salary/:empId ───────────────────────────────────────────────────────
router.get('/:empId', auth, requireRole('admin'), async (req, res) => {
  try {
    const [[structure]] = await pool.query(
      `SELECT ss.id, ss.wage_type AS wageType, ss.salary_type AS salaryType,
              ss.month_wage AS monthWage, ss.year_wage AS yearWage,
              ss.working_days_per_week AS workingDaysPerWeek,
              ss.break_time_hrs AS breakTimeHrs,
              ss.pf_employee_pct AS pfEmployeePct,
              ss.pf_employer_pct AS pfEmployerPct,
              ss.professional_tax AS professionalTax
       FROM salary_structures ss
       WHERE ss.employee_id = ?`,
      [req.params.empId]
    )
    if (!structure) {
      return res.status(404).json({ error: 'No salary structure found for this employee.' })
    }

    const [components] = await pool.query(
      `SELECT label, percent, amount
       FROM salary_components
       WHERE salary_structure_id = ?
       ORDER BY sort_order`,
      [structure.id]
    )

    res.json({ ...structure, components })
  } catch (err) {
    console.error('GET /salary/:empId:', err)
    res.status(500).json({ error: 'Failed to fetch salary structure.' })
  }
})

// ─── PUT /salary/:empId — admin sets/updates salary ──────────────────────────
// § 5: amounts are auto-calculated from %; never manually typed.
// § 9: PF % and Professional Tax ₹ NOT confirmed — stored as config.
router.put(
  '/:empId',
  auth,
  requireRole('admin'),
  [
    body('wageType').optional().trim().notEmpty(),
    body('salaryType').optional().trim().notEmpty(),
    body('monthWage').isFloat({ min: 0 }).withMessage('monthWage must be a positive number.'),
    body('workingDaysPerWeek').optional().isInt({ min: 1, max: 7 }),
    body('breakTimeHrs').optional().isFloat({ min: 0 }),
    body('pfEmployeePct').optional().isFloat({ min: 0, max: 100 }),
    body('pfEmployerPct').optional().isFloat({ min: 0, max: 100 }),
    body('professionalTax').optional().isFloat({ min: 0 }),
    body('components').optional().isArray().withMessage('components must be an array.')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

    const {
      wageType, salaryType, monthWage,
      workingDaysPerWeek, breakTimeHrs,
      pfEmployeePct, pfEmployerPct, professionalTax,
      components = []
    } = req.body

    const empId = Number(req.params.empId)
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // Upsert salary structure
      const [result] = await conn.query(
        `INSERT INTO salary_structures
           (employee_id, wage_type, salary_type, month_wage,
            working_days_per_week, break_time_hrs,
            pf_employee_pct, pf_employer_pct, professional_tax)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           wage_type             = VALUES(wage_type),
           salary_type           = VALUES(salary_type),
           month_wage            = VALUES(month_wage),
           working_days_per_week = VALUES(working_days_per_week),
           break_time_hrs        = VALUES(break_time_hrs),
           pf_employee_pct       = VALUES(pf_employee_pct),
           pf_employer_pct       = VALUES(pf_employer_pct),
           professional_tax      = VALUES(professional_tax)`,
        [
          empId,
          wageType || 'Monthly', salaryType || 'Fixed',
          monthWage,
          workingDaysPerWeek || 5, breakTimeHrs || 1,
          pfEmployeePct ?? 12, pfEmployerPct ?? 12,
          professionalTax ?? 200
        ]
      )

      // Get structure id (insert or existing)
      const [[{ id: structId }]] = await conn.query(
        'SELECT id FROM salary_structures WHERE employee_id = ?', [empId]
      )

      // Recompute and replace components
      // § 5: amounts are always calculated from % of month_wage — never manually set
      if (components.length > 0) {
        await conn.query('DELETE FROM salary_components WHERE salary_structure_id = ?', [structId])
        for (let i = 0; i < components.length; i++) {
          const c = components[i]
          const amount = parseFloat(((c.percent / 100) * monthWage).toFixed(2))
          await conn.query(
            `INSERT INTO salary_components (salary_structure_id, label, percent, amount, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [structId, c.label, c.percent, amount, i]
          )
        }
      }

      await conn.commit()
      res.json({ message: 'Salary structure updated.' })
    } catch (err) {
      await conn.rollback()
      console.error('PUT /salary/:empId:', err)
      res.status(500).json({ error: 'Failed to update salary structure.' })
    } finally {
      conn.release()
    }
  }
)

export default router
