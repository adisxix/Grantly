import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      compareTray: [], // scholarship ids
      commandOpen: false,
      recentSearches: [],

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      addToCompare: (id) =>
        set((s) => ({
          compareTray:
            s.compareTray.includes(id) || s.compareTray.length >= 3
              ? s.compareTray
              : [...s.compareTray, id],
        })),

      removeFromCompare: (id) =>
        set((s) => ({ compareTray: s.compareTray.filter((c) => c !== id) })),

      clearCompare: () => set({ compareTray: [] }),

      setCommandOpen: (commandOpen) => set({ commandOpen }),

      addRecentSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 8),
        })),
    }),
    { name: 'grantly:v1:ui' },
  ),
)
