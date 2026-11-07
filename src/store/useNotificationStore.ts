import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/utils'

/**
 * @typedef {import('@/data/models').AppNotification} AppNotification
 */

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      /** @type {AppNotification[]} */
      notifications: [],

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { id: uid(), read: false, at: new Date().toISOString(), ...n },
            ...s.notifications,
          ].slice(0, 100),
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      setNotifications: (notifications) => set({ notifications }),
    }),
    { name: 'grantly:v1:notifications' },
  ),
)
