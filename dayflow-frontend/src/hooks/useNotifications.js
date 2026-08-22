import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api.js'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await api.get('/notifications')
      if (Array.isArray(data)) {
        setNotifications(data)
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifs()

    // Periodically poll every 30s to keep notifications live
    const interval = setInterval(fetchNotifs, 30000)

    // Listen to custom refresh events
    function onRefresh() {
      fetchNotifs()
    }
    window.addEventListener('dayflow:refresh-notifications', onRefresh)

    return () => {
      clearInterval(interval)
      window.removeEventListener('dayflow:refresh-notifications', onRefresh)
    }
  }, [fetchNotifs])

  const markAllAsRead = async () => {
    // Optimistically mark as read in local state
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })))
    try {
      await api.put('/notifications/read-all', {})
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
    )
    try {
      await api.put(`/notifications/${id}/read`, {})
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAllAsRead,
    markAsRead,
    refetch: fetchNotifs
  }
}
