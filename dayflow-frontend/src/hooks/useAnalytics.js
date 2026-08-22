import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api.js'

export function useAnalytics() {
  const [overview, setOverview]       = useState(null)
  const [trends, setTrends]           = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ov, tr, dp] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/attendance-trends'),
        api.get('/analytics/department-breakdown')
      ])
      setOverview(ov)
      setTrends(tr)
      setDepartments(dp)
    } catch (err) {
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    overview,
    trends,
    departments,
    loading,
    error,
    refetch: fetchAnalytics
  }
}
