import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

/** Admin-only: fetch salary structure for an employee */
export function useSalary(employeeId) {
  const [salary,  setSalary]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!employeeId) { setLoading(false); return }
    setLoading(true)
    api.get(`/salary/${employeeId}`)
      .then(setSalary)
      .catch(err => {
        // 404 means no salary structure yet — not a fatal error
        if (err.status === 404) { setSalary(null); setError(null) }
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [employeeId])

  return { salary, loading, error }
}
