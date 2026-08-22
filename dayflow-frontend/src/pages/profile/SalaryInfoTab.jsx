import { Lock, ShieldAlert } from 'lucide-react'
import { useSalary } from '../../hooks/useSalary.js'

// § 5 — visible ONLY when the viewer is admin (enforced by ProfilePage).
export default function SalaryInfoTab({ employeeId }) {
  const { salary: s, loading, error } = useSalary(employeeId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        Failed to load salary structure: {error}
      </div>
    )
  }

  if (!s) {
    return (
      <div className="rounded-xl border border-dashed border-base-border py-16 text-center">
        <p className="text-sm text-slate-400">No salary structure configured for this employee yet.</p>
      </div>
    )
  }

  const monthWageNum = Number(s.monthWage || 0)
  const totalComponents = s.components?.reduce((sum, c) => sum + Number(c.amount || 0), 0) || 0
  const totalPct = s.components?.reduce((sum, c) => sum + Number(c.percent || 0), 0) || 0
  const empPfAmt = (monthWageNum * (Number(s.pfEmployeePct || 12) / 100))
  const emplrPfAmt = (monthWageNum * (Number(s.pfEmployerPct || 12) / 100))
  const ptTax = Number(s.professionalTax || 200)

  return (
    <div className="space-y-6">
      {/* Admin Notice Banner */}
      <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-medium">
            Confidential Payroll Record — Visible exclusively to HR Administrators. All compensation component amounts are auto-calculated from base wage percentages.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 rounded px-2 py-0.5 text-amber-300 font-semibold">
          Admin View
        </span>
      </div>

      {/* ── Wage Header Tiles ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HeaderTile label="Wage Type" value={s.wageType} />
        <HeaderTile label="Salary Type" value={s.salaryType} />
        <HeaderTile
          label="Monthly Base Wage"
          value={`₹${monthWageNum.toLocaleString('en-IN')}`}
          accent
        />
        <HeaderTile
          label="Yearly Base Wage"
          value={`₹${Number(s.yearWage || monthWageNum * 12).toLocaleString('en-IN')}`}
          accent
        />
        <HeaderTile label="Working Days / Week" value={`${s.workingDaysPerWeek} Days`} />
        <HeaderTile label="Break Time Allocation" value={`${s.breakTimeHrs} Hour / Day`} />
      </div>

      {/* ── Salary Components Table ── */}
      <div className="overflow-hidden rounded-2xl border border-base-border bg-base-card shadow-subtle">
        <div className="border-b border-base-border bg-base-panel px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Compensation Components</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Statutory breakdown calculated automatically from defined wage formulas
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-base-panel border border-base-border rounded-lg px-2.5 py-1 w-fit shadow-subtle">
            <Lock className="h-3 w-3 text-accent" />
            <span>Formula Locked</span>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead className="border-b border-base-border bg-base-panel text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3.5">Component</th>
              <th className="px-6 py-3.5 text-right">Calculation Rule</th>
              <th className="px-6 py-3.5 text-right">Rate (%)</th>
              <th className="px-6 py-3.5 text-right">Amount (₹ / Month)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-border">
            {s.components?.map((c, i) => (
              <tr
                key={c.label}
                className={`transition-colors hover:bg-base-panel/70 ${
                  i % 2 === 0 ? 'bg-base-card' : 'bg-base-panel/40'
                }`}
              >
                <td className="px-6 py-3.5 font-medium text-white">
                  {c.label}
                </td>
                <td className="px-6 py-3.5 text-right text-slate-400">
                  {c.label === 'House Rent Allowance' ? '50% of Basic' : 'Base Wage Ratio'}
                </td>
                <td className="px-6 py-3.5 text-right font-mono font-medium text-slate-300">
                  {c.percent}%
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Lock className="h-3 w-3 text-slate-500" title="Auto-calculated amount" />
                    <span className="font-mono font-semibold text-white">
                      ₹{Number(c.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-accent/30 bg-accent/5">
              <td className="px-6 py-4 text-xs font-bold text-white">
                Total Monthly Gross
              </td>
              <td />
              <td className="px-6 py-4 text-right font-mono text-xs font-bold text-accent">
                {totalPct}%
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm font-bold text-accent">
                ₹{totalComponents.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── PF & Statutory Deductions Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* PF Contributions */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5 shadow-subtle">
          <div className="flex items-center justify-between border-b border-base-border pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Provident Fund (PF) Contributions
            </h3>
            <span className="font-mono text-[10px] text-accent bg-accent/15 px-2 py-0.5 rounded font-semibold">
              Statutory
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-base-border">
              <span className="text-slate-400">Employee Contribution</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-white">{s.pfEmployeePct}%</span>
                <span className="text-slate-400">(₹{empPfAmt.toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-base-border">
              <span className="text-slate-400">Employer Contribution</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-white">{s.pfEmployerPct}%</span>
                <span className="text-slate-400">(₹{emplrPfAmt.toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-white">Total PF Monthly Remittance</span>
              <span className="font-mono font-bold text-accent">
                ₹{(empPfAmt + emplrPfAmt).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Deductions */}
        <div className="rounded-2xl border border-base-border bg-base-card p-5 shadow-subtle">
          <div className="flex items-center justify-between border-b border-base-border pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Deductions
            </h3>
            <span className="font-mono text-[10px] text-slate-400 bg-base-panel border border-base-border px-2 py-0.5 rounded font-semibold">
              State Tax
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-base-border">
              <span className="text-slate-400">Professional Tax (PT)</span>
              <span className="font-mono font-semibold text-white">₹{ptTax} / month</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-base-border">
              <span className="text-slate-400">Annualized PT Deduction</span>
              <span className="font-mono font-medium text-slate-400">₹{(ptTax * 12).toLocaleString('en-IN')} / year</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-white">Total Monthly Deductions</span>
              <span className="font-mono font-bold text-white">
                ₹{(empPfAmt + ptTax).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderTile({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card p-4 shadow-subtle">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 font-mono text-base font-bold ${accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
