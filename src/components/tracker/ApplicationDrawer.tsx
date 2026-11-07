import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2, Plus, X, Send, Award, Link2, FileText, PenLine,
} from 'lucide-react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ProgressRing } from '@/components/ui/progress-ring'
import {
  APP_STATUSES, APP_STATUS_LABELS, DOC_TYPE_LABELS,
} from '@/data/constants'
import { getScholarship } from '@/data/scholarships'
import { readinessScore, matchColour } from '@/features/match/engine'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEssayStore } from '@/store/useEssayStore'
import { formatDate, formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Full application editor in a side drawer.
 * @param {{ appId: string | null, onClose: () => void }} props
 */
export function ApplicationDrawer({ appId, onClose }) {
  const navigate = useNavigate()
  const app = useApplicationStore((s) => s.applications.find((a) => a.id === appId))
  const updateApplication = useApplicationStore((s) => s.updateApplication)
  const deleteApplication = useApplicationStore((s) => s.deleteApplication)
  const toggleChecklistItem = useApplicationStore((s) => s.toggleChecklistItem)
  const addChecklistItem = useApplicationStore((s) => s.addChecklistItem)
  const removeChecklistItem = useApplicationStore((s) => s.removeChecklistItem)
  const attachDocument = useApplicationStore((s) => s.attachDocument)
  const detachDocument = useApplicationStore((s) => s.detachDocument)
  const markSubmitted = useApplicationStore((s) => s.markSubmitted)
  const markAwarded = useApplicationStore((s) => s.markAwarded)
  const documents = useDocumentStore((s) => s.documents)
  const essays = useEssayStore((s) => s.essays)

  const [newItem, setNewItem] = useState('')
  const [notes, setNotes] = useState(app?.notes || '')
  const [submitDialog, setSubmitDialog] = useState(false)
  const [awardDialog, setAwardDialog] = useState(false)
  const [confNo, setConfNo] = useState('')
  const [awardAmount, setAwardAmount] = useState('')

  useEffect(() => {
    setNotes(app?.notes || '')
  }, [appId, app?.notes])

  if (!appId || !app) {
    return (
      <Drawer open={!!appId} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent side="right" />
      </Drawer>
    )
  }

  const scholarship = getScholarship(app.scholarshipId)
  if (!scholarship) return null

  const readiness = readinessScore(app, scholarship)

  function handleStatusChange(status) {
    if (status === 'submitted') {
      setSubmitDialog(true)
      return
    }
    if (status === 'awarded') {
      setAwardDialog(true)
      return
    }
    updateApplication(app.id, { status })
    toast.success(`Status: ${APP_STATUS_LABELS[status]}`)
  }

  function handleSubmit() {
    markSubmitted(app.id, confNo)
    setSubmitDialog(false)
    setConfNo('')
    toast.success('Application submitted!')
  }

  function handleAward() {
    const amount = Number(awardAmount) || 0
    markAwarded(app.id, amount)
    setAwardDialog(false)
    setAwardAmount('')
    toast.success(`Awarded ${formatCurrency(amount, scholarship.amount.currency)}! 🎉`)
  }

  function handleDelete() {
    deleteApplication(app.id)
    onClose()
    toast('Application deleted')
  }

  function handleAddItem() {
    if (!newItem.trim()) return
    addChecklistItem(app.id, newItem.trim())
    setNewItem('')
  }

  return (
    <Drawer open={!!appId} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="right" className="w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{scholarship.name}</DrawerTitle>
          <DrawerDescription>{scholarship.provider}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 pb-6 pr-2">
          {/* Status + readiness */}
          <div className="flex items-center gap-4">
            <ProgressRing value={readiness} size={64} stroke={6} tier={matchColour(readiness)} sublabel="ready" />
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={app.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{APP_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {app.submittedAt && (
            <div className="rounded-md bg-surface-2 p-3 text-sm">
              <p className="text-ink-muted">Submitted: {formatDate(app.submittedAt)}</p>
              {app.confirmationNo && <p className="text-ink-muted">Confirmation: <span className="font-mono">{app.confirmationNo}</span></p>}
            </div>
          )}
          {app.amountAwarded != null && (
            <div className="rounded-md bg-success/10 p-3 text-sm">
              <p className="font-semibold text-success">Awarded: {formatCurrency(app.amountAwarded, scholarship.amount.currency)} 🎉</p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Checklist</h3>
            <div className="space-y-1.5">
              {app.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <Checkbox checked={item.done} onCheckedChange={() => toggleChecklistItem(app.id, item.id)} />
                  <span className={cn('flex-1 text-sm', item.done && 'text-ink-subtle line-through')}>{item.label}</span>
                  {item.docType && <Badge variant="default" className="text-[10px]">{DOC_TYPE_LABELS[item.docType]}</Badge>}
                  <button onClick={() => removeChecklistItem(app.id, item.id)} className="text-ink-subtle hover:text-coral">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add checklist item"
                className="h-9"
              />
              <Button size="icon" variant="secondary" onClick={handleAddItem} aria-label="Add item">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Documents</h3>
            <div className="space-y-1.5">
              {app.documentIds.length === 0 && (
                <p className="text-xs text-ink-muted">No documents attached yet.</p>
              )}
              {app.documentIds.map((docId) => {
                const doc = documents.find((d) => d.id === docId)
                if (!doc) return null
                return (
                  <div key={docId} className="flex items-center gap-2 rounded-md border border-border p-2">
                    <FileText className="h-4 w-4 text-ink-muted" />
                    <span className="flex-1 truncate text-sm">{doc.name}</span>
                    <button onClick={() => detachDocument(app.id, docId)} className="text-ink-subtle hover:text-coral">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="mt-2">
              <Select onValueChange={(docId) => attachDocument(app.id, docId)}>
                <SelectTrigger className="h-9"><span className="flex items-center gap-2 text-ink-muted"><Link2 className="h-3.5 w-3.5" /> Attach from vault</span></SelectTrigger>
                <SelectContent>
                  {documents.filter((d) => !app.documentIds.includes(d.id)).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Essays */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Essays</h3>
            <div className="space-y-1.5">
              {app.essayIds.length === 0 && (
                <p className="text-xs text-ink-muted">No essays linked yet.</p>
              )}
              {app.essayIds.map((essayId) => {
                const essay = essays.find((e) => e.id === essayId)
                if (!essay) return null
                return (
                  <button
                    key={essayId}
                    onClick={() => { onClose(); navigate(`/app/essays/${essayId}`) }}
                    className="flex w-full items-center gap-2 rounded-md border border-border p-2 text-left hover:bg-surface-2"
                  >
                    <PenLine className="h-4 w-4 text-ink-muted" />
                    <span className="flex-1 truncate text-sm">{essay.title}</span>
                  </button>
                )
              })}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => { onClose(); navigate('/app/essays') }}
            >
              <Plus className="h-3.5 w-3.5" /> Link essay
            </Button>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => updateApplication(app.id, { notes })}
              placeholder="Add your notes here…"
              rows={4}
            />
          </div>

          {/* Activity */}
          {app.activity.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Activity</h3>
              <div className="space-y-1.5">
                {app.activity.slice(-5).reverse().map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="h-1 w-1 rounded-full bg-jade-600" />
                    <span>{a.text}</span>
                    <span className="ml-auto">{formatDate(a.at, 'short')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {app.status !== 'submitted' && app.status !== 'awarded' && (
              <Button size="sm" onClick={() => handleStatusChange('submitted')}>
                <Send className="h-3.5 w-3.5" /> Mark submitted
              </Button>
            )}
            {app.status === 'submitted' && (
              <Button size="sm" onClick={() => setAwardDialog(true)}>
                <Award className="h-3.5 w-3.5" /> Mark awarded
              </Button>
            )}
            <Button size="sm" variant="danger" onClick={handleDelete} className="ml-auto">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Submit dialog */}
        {submitDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lift">
              <h3 className="font-display text-lg font-semibold">Mark as submitted</h3>
              <p className="mt-1 text-sm text-ink-muted">Enter your confirmation number (optional).</p>
              <Input value={confNo} onChange={(e) => setConfNo(e.target.value)} placeholder="e.g. GR-2024-00123" className="mt-3" />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSubmitDialog(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Confirm</Button>
              </div>
            </div>
          </div>
        )}

        {/* Award dialog */}
        {awardDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lift">
              <h3 className="font-display text-lg font-semibold">Mark as awarded 🎉</h3>
              <p className="mt-1 text-sm text-ink-muted">Enter the awarded amount.</p>
              <Input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                placeholder="Amount"
                className="mt-3"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAwardDialog(false)}>Cancel</Button>
                <Button variant="cta" onClick={handleAward}>Confirm</Button>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
