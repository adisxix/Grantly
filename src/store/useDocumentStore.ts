import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/utils'
import { saveBlob, deleteBlob } from '@/lib/storage'

/**
 * @typedef {import('@/data/models').VaultDocument} VaultDocument
 */

export const useDocumentStore = create(
  persist(
    (set, get) => ({
      /** @type {VaultDocument[]} */
      documents: [],

      /** Upload a file to the vault. */
      addDocument: async (file, type, tags = []) => {
        const id = uid()
        const blobKey = await saveBlob(id, file)
        const doc = {
          id,
          name: file.name,
          type,
          size: file.size,
          mime: file.type,
          uploadedAt: new Date().toISOString(),
          tags,
          blobKey,
        }
        set((s) => ({ documents: [doc, ...s.documents] }))
        return doc
      },

      /** Add a document from demo data (no real blob). */
      addDemoDocument: (doc) =>
        set((s) => ({ documents: [doc, ...s.documents] })),

      renameDocument: (id, name) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, name } : d)),
        })),

      tagDocument: (id, tags) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, tags } : d)),
        })),

      setExpiry: (id, expiresAt) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, expiresAt } : d)),
        })),

      deleteDocument: async (id) => {
        const doc = get().documents.find((d) => d.id === id)
        if (doc) await deleteBlob(doc.blobKey)
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }))
      },

      getByType: (type) => get().documents.filter((d) => d.type === type),

      setDocuments: (documents) => set({ documents }),
    }),
    { name: 'grantly:v1:documents' },
  ),
)
