import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, FileText, Trash2, Eye, Tag, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
 
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { getScholarship } from '@/data/scholarships'
import { DOC_TYPES, DOC_TYPE_LABELS } from '@/data/constants'
import { getBlobURL } from '@/lib/storage'
import { formatBytes, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export default function Documents() {
  const documents = useDocumentStore((s) => s.documents)
  const addDocument = useDocumentStore((s) => s.addDocument)
  const deleteDocument = useDocumentStore((s) => s.deleteDocument)
  const renameDocument = useDocumentStore((s) => s.renameDocument)
  const applications = useApplicationStore((s) => s.applications)
  const dropRef = useRef(null)
  const fileRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function openFilePicker() {
    fileRef.current?.click()
  }

  const handleFiles = useCallback(async (files) => {
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 5 MB`)
        continue
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported type`)
        continue
      }
      // Guess doc type from name
      const nameLower = file.name.toLowerCase()
      let type = 'other'
      if (nameLower.includes('transcript') || nameLower.includes('mark')) type = 'transcript'
      else if (nameLower.includes('income')) type = 'income_certificate'
      else if (nameLower.includes('id') || nameLower.includes('aadhaar')) type = 'id_proof'
      else if (nameLower.includes('recommend') || nameLower.includes('letter')) type = 'recommendation'
      else if (nameLower.includes('resume') || nameLower.includes('cv')) type = 'resume'
      else if (nameLower.includes('photo') || file.type.startsWith('image/')) type = 'photo'
      else if (nameLower.includes('category') || nameLower.includes('caste')) type = 'category_certificate'

      try {
        await addDocument(file, type)
        toast.success(`${file.name} uploaded`)
      } catch {
        toast.error(`Could not upload ${file.name}`)
      }
    }
  }, [addDocument])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  async function handlePreview(doc) {
    const url = await getBlobURL(doc.blobKey)
    if (url) {
      setPreviewUrl(url)
      setPreviewDoc(doc)
    } else {
      toast.error('Could not load file')
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewDoc(null)
  }

  async function handleDelete(doc) {
    await deleteDocument(doc.id)
    toast.success('Document deleted')
  }

  // Missing documents across saved scholarships
  const missingDocs = useMemo(() => {
    const needed = {}
    applications.forEach((a) => {
      const s = getScholarship(a.scholarshipId)
      if (!s) return
      s.documentsRequired.forEach((dt) => {
        const has = documents.some((d) => d.type === dt)
        if (!has) {
          needed[dt] = (needed[dt] || 0) + 1
        }
      })
    })
    return Object.entries(needed).map(([type, count]) => ({ type, count }))
  }, [applications, documents])

  const filteredDocs = filterType === 'all' ? documents : documents.filter((d) => d.type === filterType)

  return (
    <div className="mx-auto max-w-content space-y-6">
      {/* Upload dropzone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openFilePicker()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-jade-600 bg-jade-50/50 dark:bg-jade-900/20' : 'border-border hover:border-jade-400 hover:bg-surface-2',
        )}
      >
        <Upload className="h-8 w-8 text-ink-subtle" />
        <p className="mt-2 text-sm font-medium">Drag and drop files here, or click to browse</p>
        <p className="mt-1 text-xs text-ink-subtle">PDF, PNG, JPG, DOCX up to 5 MB each</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          onChange={(e) => handleFiles(Array.from(e.target.files))}
          className="hidden"
          tabIndex={-1}
        />
      </div>

      {/* Missing documents */}
      {missingDocs.length > 0 && (
        <Card className="border-gold-300/40 bg-gold-50/30 dark:bg-gold-700/10">
          <h2 className="mb-2 flex items-center gap-2 font-display text-base font-semibold">
            <AlertCircle className="h-4 w-4 text-gold-600" /> Missing documents
          </h2>
          <div className="space-y-1.5">
            {missingDocs.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between rounded-md border border-border bg-surface p-2">
                <span className="text-sm">{DOC_TYPE_LABELS[type] || type}</span>
                <Badge variant="gold" className="text-[10px]">Needed for {count} scholarship{count > 1 ? 's' : ''}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Documents list */}
      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Your vault is empty"
          description="Upload documents once and reuse them across applications."
        />
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                filterType === 'all' ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300' : 'border-border',
              )}
            >
              All ({documents.length})
            </button>
            {DOC_TYPES.map((t) => {
              const count = documents.filter((d) => d.type === t).length
              if (count === 0) return null
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                    filterType === t ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300' : 'border-border',
                  )}
                >
                  {DOC_TYPE_LABELS[t]} ({count})
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc, i) => {
              const usedIn = applications.filter((a) => a.documentIds.includes(doc.id)).length
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2">
                        <FileText className="h-4 w-4 text-ink-muted" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-ink-muted">{formatBytes(doc.size)} · {formatDate(doc.uploadedAt, 'short')}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="default" className="text-[10px]">{DOC_TYPE_LABELS[doc.type]}</Badge>
                      {doc.tags.map((t) => (
                        <Badge key={t} variant="jade" className="text-[10px]">{t}</Badge>
                      ))}
                      {doc.expiresAt && (
                        <Badge variant="warning" className="text-[10px]">Exp. {formatDate(doc.expiresAt, 'short')}</Badge>
                      )}
                      {usedIn > 0 && <Badge variant="gold" className="text-[10px]">Used in {usedIn}</Badge>}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Button size="iconSm" variant="ghost" onClick={() => handlePreview(doc)} title="Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="iconSm" variant="ghost" onClick={() => {
                        const name = prompt('Rename:', doc.name)
                        if (name) { renameDocument(doc.id, name); toast.success('Renamed') }
                      }} title="Rename">
                        <Tag className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="iconSm" variant="ghost" onClick={() => handleDelete(doc)} title="Delete" className="ml-auto text-coral hover:bg-coral/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && closePreview()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewUrl && previewDoc?.mime.startsWith('image/') && (
            <img src={previewUrl} alt={previewDoc.name} className="max-h-[70vh] w-full rounded-md object-contain" />
          )}
          {previewUrl && previewDoc?.mime === 'application/pdf' && (
            <iframe src={previewUrl} title={previewDoc.name} className="h-[70vh] w-full rounded-md" />
          )}
          {previewUrl && !previewDoc?.mime.startsWith('image/') && previewDoc?.mime !== 'application/pdf' && (
            <p className="py-8 text-center text-sm text-ink-muted">Preview not available for this file type.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
