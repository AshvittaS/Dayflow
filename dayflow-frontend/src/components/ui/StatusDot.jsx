// § 3 — status indicator: green = present, airplane = on leave, yellow = absent
export default function StatusDot({ status }) {
  if (status === 'leave') {
    return (
      <span title="On leave" className="text-lg leading-none">✈️</span>
    )
  }
  const color = status === 'present' ? 'bg-status-present' : 'bg-status-absent'
  const label = status === 'present' ? 'Present' : 'Absent'
  return (
    <span
      title={label}
      className={`inline-block h-3 w-3 rounded-full ${color} ring-2 ring-base-card`}
    />
  )
}
