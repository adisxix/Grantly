import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/utils'

/**
 * @typedef {import('@/data/models').Essay} Essay
 */

export const useEssayStore = create(
  persist(
    (set, get) => ({
      /** @type {Essay[]} */
      essays: [],

      createEssay: (partial) => {
        const id = uid()
        const now = new Date().toISOString()
        const essay = {
          id,
          title: partial.title || 'Untitled essay',
          scholarshipId: partial.scholarshipId,
          promptId: partial.promptId,
          html: partial.html || '<p></p>',
          wordLimit: partial.wordLimit,
          versions: [{ at: now, html: partial.html || '<p></p>' }],
          updatedAt: now,
        }
        set((s) => ({ essays: [essay, ...s.essays] }))
        return essay
      },

      updateEssay: (id, html) => {
        const now = new Date().toISOString()
        set((s) => ({
          essays: s.essays.map((e) =>
            e.id === id
              ? {
                  ...e,
                  html,
                  updatedAt: now,
                  versions: [{ at: now, html }, ...e.versions].slice(0, 20),
                }
              : e,
          ),
        }))
      },

      renameEssay: (id, title) =>
        set((s) => ({
          essays: s.essays.map((e) => (e.id === id ? { ...e, title } : e)),
        })),

      restoreVersion: (id, version) => {
        const now = new Date().toISOString()
        set((s) => ({
          essays: s.essays.map((e) =>
            e.id === id
              ? {
                  ...e,
                  html: version.html,
                  updatedAt: now,
                  versions: [{ at: now, html: version.html }, ...e.versions].slice(0, 20),
                }
              : e,
          ),
        }))
      },

      duplicateEssay: (id) => {
        const original = get().essays.find((e) => e.id === id)
        if (!original) return null
        const newId = uid()
        const now = new Date().toISOString()
        const copy = {
          ...original,
          id: newId,
          title: `${original.title} (copy)`,
          updatedAt: now,
          versions: [{ at: now, html: original.html }],
        }
        set((s) => ({ essays: [copy, ...s.essays] }))
        return copy
      },

      deleteEssay: (id) =>
        set((s) => ({ essays: s.essays.filter((e) => e.id !== id) })),

      getById: (id) => get().essays.find((e) => e.id === id),

      setEssays: (essays) => set({ essays }),
    }),
    { name: 'grantly:v1:essays' },
  ),
)
