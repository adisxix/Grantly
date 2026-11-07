import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/utils'
import { getScholarship } from '@/data/scholarships'

/**
 * @typedef {import('@/data/models').Application} Application
 */

function seedChecklist(scholarshipId) {
  const s = getScholarship(scholarshipId)
  if (!s) return []
  const items = []
  s.documentsRequired.forEach((docType) => {
    items.push({ id: uid(), label: `Upload ${docType.replace(/_/g, ' ')}`, done: false, docType })
  })
  s.steps.forEach((step) => {
    items.push({ id: uid(), label: step, done: false })
  })
  return items
}

export const useApplicationStore = create(
  persist(
    (set, get) => ({
      /** @type {Application[]} */
      applications: [],

      /** Save a scholarship (creates an application in 'saved' status) */
      saveScholarship: (scholarshipId) => {
        const existing = get().applications.find((a) => a.scholarshipId === scholarshipId)
        if (existing) return existing.id
        const id = uid()
        const now = new Date().toISOString()
        const app = {
          id,
          scholarshipId,
          status: 'saved',
          notes: '',
          checklist: seedChecklist(scholarshipId),
          documentIds: [],
          essayIds: [],
          reminders: [7, 3, 1],
          updatedAt: now,
          activity: [{ at: now, text: 'Saved to tracker' }],
        }
        set((s) => ({ applications: [...s.applications, app] }))
        return id
      },

      unsaveScholarship: (scholarshipId) =>
        set((s) => ({
          applications: s.applications.filter((a) => a.scholarshipId !== scholarshipId),
        })),

      isSaved: (scholarshipId) => get().applications.some((a) => a.scholarshipId === scholarshipId),

      getById: (id) => get().applications.find((a) => a.id === id),

      getByScholarshipId: (scholarshipId) =>
        get().applications.find((a) => a.scholarshipId === scholarshipId),

      /** Update an application with partial data */
      updateApplication: (id, partial) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? { ...a, ...partial, updatedAt: new Date().toISOString() }
              : a,
          ),
        })),

      /** Move application to a new status (Kanban) */
      moveApplication: (id, status) => {
        const now = new Date().toISOString()
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  updatedAt: now,
                  activity: [...a.activity, { at: now, text: `Moved to ${status}` }],
                }
              : a,
          ),
        }))
      },

      /** Toggle a checklist item */
      toggleChecklistItem: (appId, itemId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  checklist: a.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        })),

      /** Reorder checklist items */
      reorderChecklist: (appId, newOrder) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId ? { ...a, checklist: newOrder } : a,
          ),
        })),

      /** Add a checklist item */
      addChecklistItem: (appId, label) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  checklist: [...a.checklist, { id: uid(), label, done: false }],
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        })),

      /** Remove a checklist item */
      removeChecklistItem: (appId, itemId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  checklist: a.checklist.filter((c) => c.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        })),

      /** Attach a document to an application */
      attachDocument: (appId, docId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId && !a.documentIds.includes(docId)
              ? { ...a, documentIds: [...a.documentIds, docId], updatedAt: new Date().toISOString() }
              : a,
          ),
        })),

      /** Detach a document */
      detachDocument: (appId, docId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? { ...a, documentIds: a.documentIds.filter((d) => d !== docId), updatedAt: new Date().toISOString() }
              : a,
          ),
        })),

      /** Link an essay */
      linkEssay: (appId, essayId) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId && !a.essayIds.includes(essayId)
              ? { ...a, essayIds: [...a.essayIds, essayId], updatedAt: new Date().toISOString() }
              : a,
          ),
        })),

      /** Set the awarded amount */
      markAwarded: (id, amount) => {
        const now = new Date().toISOString()
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'awarded',
                  amountAwarded: amount,
                  updatedAt: now,
                  activity: [...a.activity, { at: now, text: `Awarded ${amount}` }],
                }
              : a,
          ),
        }))
      },

      /** Mark submitted with confirmation number */
      markSubmitted: (id, confirmationNo) => {
        const now = new Date().toISOString()
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'submitted',
                  submittedAt: now,
                  confirmationNo,
                  updatedAt: now,
                  activity: [...a.activity, { at: now, text: `Submitted (${confirmationNo || 'no conf #'})` }],
                }
              : a,
          ),
        }))
      },

      /** Add an activity entry */
      addActivity: (appId, text) => {
        const now = new Date().toISOString()
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId
              ? { ...a, activity: [...a.activity, { at: now, text }] }
              : a,
          ),
        }))
      },

      /** Delete an application */
      deleteApplication: (id) =>
        set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),

      /** Replace all applications (for demo/import) */
      setApplications: (apps) => set({ applications: apps }),
    }),
    { name: 'grantly:v1:applications' },
  ),
)
