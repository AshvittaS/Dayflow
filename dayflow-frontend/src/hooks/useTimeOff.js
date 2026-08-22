import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

/** Fetches time-off requests (employee: own, admin: all) */
export function useTimeOff(statusFilter = null) {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function fetch_() {
    setLoading(true)
    setError(null)
    try {
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
      const data = await api.get(`/timeoff${qs}`)
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [statusFilter])
  return { requests, loading, error, refetch: fetch_, setRequests }
}

/** Admin: fetch leave allocations per employee */
export function useAllocations() {
  const [allocations, setAllocations] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    api.get('/timeoff/allocations')
      .then(setAllocations)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { allocations, loading, error }
}

/** Employee: submit a new time-off request (supports file upload) */
export async function submitTimeOff({ type, startDate, endDate, daysRequested, attachment }) {
  const form = new FormData()
  form.append('type', type)
  form.append('startDate', startDate)
  form.append('endDate', endDate)
  form.append('daysRequested', String(daysRequested))
  if (attachment) form.append('attachment', attachment)
  return api.postForm('/timeoff', form)
}

/** Admin: approve or reject a request */
export async function reviewRequest(id, status) {
  return api.put(`/timeoff/${id}/status`, { status })
}
