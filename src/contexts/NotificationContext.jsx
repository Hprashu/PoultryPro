import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import useRealtimeCollection from '../hooks/useRealtimeCollection.js'
import { addDocument, updateDocument, deleteDocument, COLLECTIONS } from '../firebase'
import { useAuth } from './AuthContext.jsx'

const NotificationContext = createContext(null)

const MOCK_NOTIFICATIONS = [
  {
    id: 'mock-notif-1',
    title: 'Low Feed Inventory',
    detail: 'Layer Mash stock is below 150 kg (critical threshold).',
    type: 'warning',
    category: 'Feed',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-notif-2',
    title: 'Overdue Vaccination',
    detail: 'Flock #C103 is overdue for Newcastle vaccine.',
    type: 'critical',
    category: 'Vaccination',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-notif-3',
    title: 'Environmental Stress',
    detail: 'Temperature in Brooder House is slightly high (34°C).',
    type: 'info',
    category: 'Health',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { data: records, setData: setRecords, loading, error, isOffline } = useRealtimeCollection(
    COLLECTIONS.notifications,
    [],
    { mockData: MOCK_NOTIFICATIONS }
  )

  const unreadCount = useMemo(() => {
    return records.filter((n) => !n.read).length
  }, [records])

  const addNotification = async (notification) => {
    const payload = {
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    }

    if (isOffline) {
      const localNotification = {
        ...payload,
        id: `local-notif-${Date.now()}`,
      }
      const updated = [localNotification, ...records]
      setRecords(updated)
      window.localStorage.setItem('poultrypro_notifications', JSON.stringify(updated))
      console.log('[Offline] Added notification locally')
    } else {
      try {
        await addDocument(COLLECTIONS.notifications, payload, user?.uid || '')
      } catch (err) {
        console.error('Failed to add Firestore notification, adding locally', err)
        // Fallback
        const localNotification = {
          ...payload,
          id: `local-notif-${Date.now()}`,
        }
        const updated = [localNotification, ...records]
        setRecords(updated)
        window.localStorage.setItem('poultrypro_notifications', JSON.stringify(updated))
      }
    }
  };

  const markRead = async (id) => {
    if (isOffline || String(id).startsWith('local-') || String(id).startsWith('mock-')) {
      const updated = records.map((n) => (n.id === id ? { ...n, read: true } : n))
      setRecords(updated)
      window.localStorage.setItem('poultrypro_notifications', JSON.stringify(updated))
      console.log('[Offline] Marked notification read locally')
    } else {
      try {
        await updateDocument(COLLECTIONS.notifications, id, { read: true })
      } catch (err) {
        console.error('Failed to mark notification read in Firestore, updating locally', err)
        const updated = records.map((n) => (n.id === id ? { ...n, read: true } : n))
        setRecords(updated)
        window.localStorage.setItem('poultrypro_notifications', JSON.stringify(updated))
      }
    }
  }

  const markAllRead = async () => {
    const updated = records.map((n) => ({ ...n, read: true }))
    setRecords(updated)
    window.localStorage.setItem('poultrypro_notifications', JSON.stringify(updated))

    if (!isOffline) {
      // Perform batch update or sequential updates for non-local notifications
      const dbNotifs = records.filter((n) => !n.read && !String(n.id).startsWith('local-') && !String(n.id).startsWith('mock-'))
      try {
        await Promise.all(dbNotifs.map((n) => updateDocument(COLLECTIONS.notifications, n.id, { read: true })))
      } catch (err) {
        console.error('Failed to update all notifications in Firestore', err)
      }
    }
  }

  const clearAll = async () => {
    const localOnly = records.filter((n) => String(n.id).startsWith('local-') || String(n.id).startsWith('mock-'))
    const dbNotifs = records.filter((n) => !String(n.id).startsWith('local-') && !String(n.id).startsWith('mock-'))

    setRecords([])
    window.localStorage.setItem('poultrypro_notifications', JSON.stringify([]))

    if (!isOffline && dbNotifs.length > 0) {
      try {
        await Promise.all(dbNotifs.map((n) => deleteDocument(COLLECTIONS.notifications, n.id)))
      } catch (err) {
        console.error('Failed to delete notifications from Firestore', err)
      }
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications: records,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        clearAll,
        loading,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
