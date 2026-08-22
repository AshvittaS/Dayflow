import { useSalary } from '../../hooks/useSalary.js'

// § 5 — visible ONLY when the viewer is admin (enforced by ProfilePage).
export default function SalaryInfoTab({ employeeId }) {
  const { salary: s, loading, error } = useSalary(employeeId)

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      Failed to load salary structure: {error}
    </div>
  )

  if (!s) return (
    <div className="rounded-xl border border-dashed border-base-border py-16 text-center">
      <p className="text-sm text-slate-400">No salary structure set for this employee yet.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Wage header */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HeaderField label="Wage Type"           value={s.wageType} />
        <HeaderField label="Salary Type"         value={s.salaryType} />
        <HeaderField label="Month Wage"          value={`₹${Number(s.monthWage).toLocaleString('en-IN')}`} accent />
        <HeaderField label="Yearly Wage"         value={`₹${Number(s.yearWage).toLocaleString('en-IN')}`} accent />
        <HeaderField label="Working Days / Week" value={`${s.workingDaysPerWeek} days`} />
        <HeaderField label="Break Time"          value={`${s.breakTimeHrs} hr`} />
      </div>

      {/* Salary Components */}
      <div className="overflow-hidden rounded-xl border border-base-border">
        <div className="border-b border-base-border bg-base-panel px-5 py-3">
          <h3 className="text-sm font-semibold text-white">Salary Components</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Each amount is derived from % of month wage. Confirm exact percentages before go-live (SKILL.md §5 / §9).
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-base-panel text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3">Component</th>
              <th className="px-5 py-3 text-right">%</th>
              <th className="px-5 py-3 text-right">Amount / month</th>
            </tr>
          </thead>
          <tbody>
            {s.components?.map((c, i) => (
              <tr key={c.label} className={`border-t border-base-border ${i % 2 === 0 ? 'bg-base-card' : 'bg-base-panel'}`}>
                <td className="px-5 py-3 font-medium text-white">{c.label}</td>
                <td className="px-5 py-3 text-right text-slate-400">{c.percent}%</td>
                <td className="px-5 py-3 text-right font-semibold text-white">₹{Number(c.amount).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-accent/30 bg-accent/5">
              <td className="px-5 py-3 font-semibold text-white">Total</td>
              <td />
              <td className="px-5 py-3 text-right font-bold text-accent">
                ₹{s.components?.reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* PF & Deductions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-base-border bg-base-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">PF Contribution</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Employee PF" value={`${s.pfEmployeePct}%`} />
            <Row label="Employer PF" value={`${s.pfEmployerPct}%`} />
          </dl>
          <p className="mt-3 text-xs text-slate-600">% values pending team confirmation (SKILL.md §9).</p>
        </div>
        <div className="rounded-xl border border-base-border bg-base-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Tax Deductions</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Professional Tax" value={`₹${s.professionalTax}`} />
          </dl>
          <p className="mt-3 text-xs text-slate-600">₹ value pending team confirmation (SKILL.md §9).</p>
        </div>
      </div>
    </div>
  )
}

function HeaderField({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-base-border bg-base-card p-4">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-white">{value}</dd>
    </div>
  )
}
