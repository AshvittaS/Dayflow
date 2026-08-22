import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api.js'

/**
 * Fetches all employees in the company.
 * Returns { employees, loading, error, refetch }
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch_ = useCallback(async () => {
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
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  return { employees, loading, error, refetch: fetch_ }
}

/**
 * Fetches a single employee profile by id.
 */
export function useEmployee(id) {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchEmp = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/employees/${id}`)
      setEmployee(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEmp()
  }, [fetchEmp])

  return { employee, loading, error, refetch: fetchEmp }
}

/**
 * Admin action: Create a new employee
 */
export async function createEmployee(data) {
  return await api.post('/employees', data)
}

/**
 * Admin / Self action: Update employee details
 */
export async function updateEmployee(id, data) {
  return await api.put(`/employees/${id}`, data)
}

/**
 * Upload employee avatar photo
 */
export async function uploadAvatar(id, file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return await api.postForm(`/employees/${id}/avatar`, formData)
}

/**
 * Admin action: Delete employee account
 */
export async function deleteEmployee(id) {
  return await api.delete(`/employees/${id}`)
}
