import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'system',
      currency: 'INR',
      textSize: 'md',
      reduceMotion: false,
      highContrast: false,
      browserNotifications: false,
      reminderDays: [7, 3, 1],

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setTextSize: (textSize) => set({ textSize }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setBrowserNotifications: (browserNotifications) => set({ browserNotifications }),
      setReminderDays: (reminderDays) => set({ reminderDays }),

      reset: () =>
        set({
          theme: 'system',
          currency: 'INR',
          textSize: 'md',
          reduceMotion: false,
          highContrast: false,
          browserNotifications: false,
          reminderDays: [7, 3, 1],
        }),
    }),
    { name: 'grantly:v1:settings' },
  ),
)
