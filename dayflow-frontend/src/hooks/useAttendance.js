import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

/**
 * Fetches attendance records for the given month (YYYY-MM).
 * Defaults to the current month.
 * Admin: pass employeeId to override whose records to fetch.
 */
export function useAttendance(month = null, employeeId = null) {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ daysPresent: 0, totalWorkingDays: 22, leavesTaken: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const monthStr = month || currentMonth()

  async function fetch_() {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQs({ month: monthStr, employeeId })
      const [recs, sum] = await Promise.all([
        api.get(`/attendance${qs}`),
        api.get(`/attendance/summary${qs}`)
      ])
      setRecords(recs)
      setSummary(sum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [monthStr, employeeId])
  return { records, summary, loading, error, refetch: fetch_ }
}

export async function checkIn() {
  return api.post('/attendance/checkin')
}

export async function checkOut() {
  return api.post('/attendance/checkout')
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function buildQs(params) {
  const q = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return q ? `?${q}` : ''
}
