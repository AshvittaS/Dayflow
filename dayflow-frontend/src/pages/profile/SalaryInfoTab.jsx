import { Lock, ShieldAlert, FileText, Info } from 'lucide-react'
import { salaryStructure } from '../../data/mockData.js'

export default function SalaryInfoTab() {
  const s = salaryStructure

  return (
    <div className="space-y-6">
      {/* Admin Notice Banner */}
      <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
          <span className="font-medium">
            Confidential Payroll Record — Visible exclusively to HR Administrators. All compensation component amounts are auto-calculated from base wage percentages.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider bg-white/80 border border-amber-300 rounded px-2 py-0.5 text-amber-800 font-semibold">
          Admin View
        </span>
      </div>

      {/* ── Wage Header Tiles ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HeaderTile label="Wage Type" value={s.wageType} />
        <HeaderTile label="Salary Type" value={s.salaryType} />
        <HeaderTile
          label="Monthly Base Wage"
          value={`₹${s.monthWage.toLocaleString('en-IN')}`}
          accent
        />
        <HeaderTile
          label="Yearly Base Wage"
          value={`₹${s.yearWage.toLocaleString('en-IN')}`}
          accent
        />
        <HeaderTile label="Working Days / Week" value={`${s.workingDaysPerWeek} Days`} />
        <HeaderTile label="Break Time Allocation" value={`${s.breakTimeHrs} Hour / Day`} />
      </div>

      {/* ── Salary Components Table ── */}
      <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
        <div className="border-b border-[#EAEAEC] bg-[#FAFAFC] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1F]">Compensation Components</h3>
            <p className="mt-0.5 text-xs text-[#6B6B76]">
              Statutory breakdown calculated automatically from defined wage formulas
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B6B76] bg-white border border-[#EAEAEC] rounded-lg px-2.5 py-1 w-fit shadow-subtle">
            <Lock className="h-3 w-3 text-[#5B4FE9]" />
            <span>Formula Locked</span>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
            <tr>
              <th className="px-6 py-3.5">Component</th>
              <th className="px-6 py-3.5 text-right">Calculation Rule</th>
              <th className="px-6 py-3.5 text-right">Rate (%)</th>
              <th className="px-6 py-3.5 text-right">Amount (₹ / Month)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F1F4]">
            {s.components.map((c, i) => (
              <tr
                key={c.label}
                className={`transition-colors hover:bg-[#F9F9FB] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'
                }`}
              >
                <td className="px-6 py-3.5 font-medium text-[#1A1A1F]">
                  {c.label}
                </td>
                <td className="px-6 py-3.5 text-right text-[#6B6B76]">
                  {c.label === 'House Rent Allowance' ? '50% of Basic' : 'Base Wage Ratio'}
                </td>
                <td className="px-6 py-3.5 text-right font-mono font-medium text-[#1A1A1F]">
                  {c.percent}%
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Lock className="h-3 w-3 text-[#92929D]" title="Auto-calculated amount" />
                    <span className="font-mono font-semibold text-[#1A1A1F]">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#5B4FE9]/20 bg-[#5B4FE9]/5">
              <td className="px-6 py-4 text-xs font-bold text-[#1A1A1F]">
                Total Monthly Gross
              </td>
              <td />
              <td className="px-6 py-4 text-right font-mono text-xs font-bold text-[#5B4FE9]">
                {s.components.reduce((sum, c) => sum + c.percent, 0)}%
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm font-bold text-[#5B4FE9]">
                ₹{s.components.reduce((sum, c) => sum + c.amount, 0).toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── PF & Statutory Deductions Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* PF Contributions */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between border-b border-[#F1F1F4] pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              Provident Fund (PF) Contributions
            </h3>
            <span className="font-mono text-[10px] text-[#5B4FE9] bg-[#5B4FE9]/10 px-2 py-0.5 rounded font-semibold">
              Statutory
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#F8F9FA]">
              <span className="text-[#6B6B76]">Employee Contribution</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-[#1A1A1F]">{s.pf.employeePercent}%</span>
                <span className="text-[#92929D]">(₹{(30000 * 0.12).toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#F8F9FA]">
              <span className="text-[#6B6B76]">Employer Contribution</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-[#1A1A1F]">{s.pf.employerPercent}%</span>
                <span className="text-[#92929D]">(₹{(30000 * 0.12).toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-[#1A1A1F]">Total PF Monthly Remittance</span>
              <span className="font-mono font-bold text-[#5B4FE9]">
                ₹{(30000 * 0.24).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Deductions */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between border-b border-[#F1F1F4] pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              Tax Deductions
            </h3>
            <span className="font-mono text-[10px] text-[#6B6B76] bg-[#F8F9FA] border border-[#EAEAEC] px-2 py-0.5 rounded font-semibold">
              State Tax
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#F8F9FA]">
              <span className="text-[#6B6B76]">Professional Tax (PT)</span>
              <span className="font-mono font-semibold text-[#1A1A1F]">₹{s.professionalTax} / month</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#F8F9FA]">
              <span className="text-[#6B6B76]">Annualized PT Deduction</span>
              <span className="font-mono font-medium text-[#6B6B76]">₹{(s.professionalTax * 12).toLocaleString('en-IN')} / year</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-[#1A1A1F]">Total Monthly Deductions</span>
              <span className="font-mono font-bold text-[#1A1A1F]">
                ₹{((30000 * 0.12) + s.professionalTax).toLocaleString('en-IN')}
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
    <div className="rounded-xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
      <p className={`mt-1 font-mono text-base font-bold ${accent ? 'text-[#5B4FE9]' : 'text-[#1A1A1F]'}`}>
        {value}
      </p>
    </div>
  )
}
