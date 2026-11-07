import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Download, History, ChevronLeft, Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useEssayStore } from '@/store/useEssayStore'
import { getScholarship } from '@/data/scholarships'
import { countWords, formatDate, readingTime } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PROMPT_BANK = [
  { name: 'STAR', outline: 'Situation → Task → Action → Result. Describe a challenge, your role, what you did, and the measurable outcome.' },
  { name: 'Why-me', outline: 'Why this scholarship fits you specifically. Connect your background, goals, and values to the program.' },
  { name: 'Challenge-growth', outline: 'A challenge you faced → how you grew from it → how it shapes your goals. Show resilience and reflection.' },
]

export default function EssayEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const essay = useEssayStore((s) => s.essays.find((e) => e.id === id))
  const updateEssay = useEssayStore((s) => s.updateEssay)
  const renameEssay = useEssayStore((s) => s.renameEssay)
  const restoreVersion = useEssayStore((s) => s.restoreVersion)
  const [saved, setSaved] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [serifMode, setSerifMode] = useState(false)
  const saveTimer = useRef(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: essay?.html || '<p></p>',
    onUpdate: ({ editor }) => {
      setSaved(false)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const html = editor.getHTML()
        updateEssay(id, html)
        setSaved(true)
      }, 2000)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none px-6 py-4',
      },
    },
  })

  useEffect(() => {
    if (editor && essay && editor.getHTML() !== essay.html) {
      editor.commands.setContent(essay.html)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const wordCount = essay ? countWords(essay.html) : 0
  const limitPct = essay?.wordLimit ? (wordCount / essay.wordLimit) * 100 : 0

  // Writing coach heuristics
  const coach = useMemo(() => {
    const text = essay?.html?.replace(/<[^>]*>/g, ' ') || ''
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const avgSentenceLen = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0
    const words = text.toLowerCase().split(/\s+/).filter(Boolean)
    const wordFreq = {}
    words.forEach((w) => { if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1 })
    const repeated = Object.entries(wordFreq).filter(([, c]) => c > 4).map(([w]) => w)
    const passiveEstimate = (text.match(/\b(was|were|been|being|is|are|by)\b/gi) || []).length
    const hasNumbers = /\d/.test(text)
    const firstSentence = sentences[0]?.trim() || ''
    const hookCheck = firstSentence.length > 0 && firstSentence.length < 100 && !firstSentence.toLowerCase().startsWith('i am') && !firstSentence.toLowerCase().startsWith('my name')
    return {
      wordCount,
      avgSentenceLen,
      repeated,
      passivePct: wordCount > 0 ? Math.round((passiveEstimate / wordCount) * 100) : 0,
      hasNumbers,
      hookCheck,
      readingTime: readingTime(wordCount),
    }
  }, [essay, wordCount])

  if (!essay) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="font-display text-xl font-semibold">Essay not found</p>
        <Button onClick={() => navigate('/app/essays')}>Back to essays</Button>
      </div>
    )
  }

  const scholarship = essay.scholarshipId ? getScholarship(essay.scholarshipId) : null

  function exportTxt() {
    const text = essay.html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${essay.title.replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as .txt')
  }

  function exportMd() {
    const md = essay.html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ul>|<\/ul>|<ol>|<\/ol>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${essay.title.replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported as .md')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/essays')} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Essays
        </button>
        <Input
          value={essay.title}
          onChange={(e) => renameEssay(id, e.target.value)}
          className="h-9 flex-1 border-0 bg-transparent px-0 font-display text-lg font-semibold focus-visible:ring-0"
        />
        <span className={cn('flex items-center gap-1 text-xs', saved ? 'text-success' : 'text-ink-muted')}>
          {saved ? 'Saved' : 'Saving…'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-surface p-2">
            <ToolbarBtn icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} label="Bold" />
            <ToolbarBtn icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} label="Italic" />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={Heading1} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} label="H1" />
            <ToolbarBtn icon={Heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} label="H2" />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} label="Bullet list" />
            <ToolbarBtn icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} label="Numbered list" />
            <span className="mx-auto" />
            <Button size="iconSm" variant="ghost" onClick={() => setSerifMode(!serifMode)} title="Toggle serif">
              <span className="font-display text-sm">Aa</span>
            </Button>
            <Button size="iconSm" variant="ghost" onClick={() => setShowHistory(true)} title="Version history">
              <History className="h-4 w-4" />
            </Button>
            <Button size="iconSm" variant="ghost" onClick={exportTxt} title="Export .txt">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="iconSm" variant="ghost" onClick={exportMd} title="Export .md">
              <span className="font-mono text-xs">.md</span>
            </Button>
          </div>

          {/* Word count bar */}
          {essay.wordLimit && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn('h-full rounded-full transition-all', limitPct > 100 ? 'bg-danger' : limitPct > 90 ? 'bg-gold-500' : 'bg-jade-600')}
                  style={{ width: `${Math.min(100, limitPct)}%` }}
                />
              </div>
              <span className={cn('font-mono text-xs tabular-nums', limitPct > 100 ? 'text-danger' : 'text-ink-muted')}>
                {wordCount}/{essay.wordLimit}
              </span>
            </div>
          )}

          {/* Editor surface */}
          <div className="mt-2 rounded-lg border border-border bg-surface">
            <div className={cn(serifMode && '[&_.Prose-mirror]:font-display')}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Prompt */}
          {scholarship && scholarship.essayPrompts && (
            <Card>
              <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-gold-500" /> Prompt
              </h3>
              {scholarship.essayPrompts
                .filter((p) => !essay.promptId || p.id === essay.promptId)
                .map((p) => (
                  <div key={p.id}>
                    <p className="text-sm text-ink-muted">{p.prompt}</p>
                    <Badge variant="default" className="mt-2 text-[10px]">{p.maxWords} words max</Badge>
                  </div>
                ))}
            </Card>
          )}

          {/* Writing coach */}
          <Card>
            <h3 className="mb-3 font-display text-sm font-semibold">Writing coach</h3>
            <div className="space-y-2 text-sm">
              <CoachRow label="Words" value={`${coach.wordCount}${essay.wordLimit ? '/' + essay.wordLimit : ''}`} ok={limitPct <= 100 || !essay.wordLimit} />
              <CoachRow label="Avg sentence" value={`${coach.avgSentenceLen} words`} ok={coach.avgSentenceLen <= 25 || wordCount < 50} />
              <CoachRow label="Reading time" value={`${coach.readingTime} min`} ok />
              <CoachRow label="Passive estimate" value={`${coach.passivePct}%`} ok={coach.passivePct < 20} />
              <CoachRow label="Hook in first line" value={coach.hookCheck ? 'Yes' : 'Could be stronger'} ok={coach.hookCheck} />
              <CoachRow label="Uses specifics/numbers" value={coach.hasNumbers ? 'Yes' : 'Add some'} ok={coach.hasNumbers} />
              {coach.repeated.length > 0 && (
                <p className="text-xs text-warning">Repeated: {coach.repeated.join(', ')}</p>
              )}
            </div>
          </Card>

          {/* Prompt bank */}
          <Card>
            <h3 className="mb-2 font-display text-sm font-semibold">Prompt bank</h3>
            <div className="space-y-1.5">
              {PROMPT_BANK.map((p) => (
                <div key={p.name} className="rounded-md border border-border p-2">
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-muted">{p.outline}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Version history dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {essay.versions.map((v, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border p-2">
                <div>
                  <p className="text-xs text-ink-muted">{formatDate(v.at, 'medium')}</p>
                  <p className="text-xs text-ink-subtle">{countWords(v.html)} words</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    restoreVersion(id, v)
                    if (editor) editor.commands.setContent(v.html)
                    toast.success('Version restored')
                    setShowHistory(false)
                  }}
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ToolbarBtn({ icon: Icon, onClick, active, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md p-1.5 transition-colors',
        active ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function CoachRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={cn('font-medium', ok ? 'text-jade-700 dark:text-jade-300' : 'text-gold-600 dark:text-gold-400')}>{value}</span>
    </div>
  )
}
