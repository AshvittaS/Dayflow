import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

/**
 * Fetches all employees in the company.
 * Returns { employees, loading, error, refetch }
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  async function fetch_() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/employees')
      setEmployees(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [])
  return { employees, loading, error, refetch: fetch_ }
}

/**
 * Fetches a single employee profile by id.
 */
export function useEmployee(id) {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.get(`/employees/${id}`)
      .then(data => setEmployee(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { employee, loading, error }
}
