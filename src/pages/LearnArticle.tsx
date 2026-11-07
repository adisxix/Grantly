import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ARTICLES } from '@/data/articles'

function renderMarkdown(md) {
  // Escape source text before applying the small, known markdown subset.
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, (_, text) => `<h2 id="${headingId(text)}" class="font-display text-xl font-semibold mt-6 mb-2">${text}</h2>`)
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Split by ## headings to wrap paragraphs
  const sections = html.split(/(?=<h2)/)
  return sections
    .map((section) => {
      if (section.startsWith('<h2')) return section
      // Wrap plain text blocks in <p>
      return section
        .split('\n\n')
        .map((para) => para.trim() ? `<p class="text-ink-muted leading-relaxed mb-3">${para.replace(/\n/g, '<br />')}</p>` : '')
        .join('')
    })
    .join('')
}

function headingId(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
}

export default function LearnArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const article = useMemo(() => ARTICLES.find((a) => a.slug === slug), [slug])
  const related = useMemo(() => {
    if (!article) return []
    return ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3)
  }, [article])

  if (!article) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="font-display text-xl font-semibold">Article not found</p>
        <Button onClick={() => navigate('/app/learn')}>Back to Learn</Button>
      </div>
    )
  }

  // Build TOC from headings
  const headings = article.body.match(/^## (.+)$/gm) || []

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/app/learn')}
        className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Learn
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge variant="jade" className="text-[10px]">{article.category}</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">{article.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{article.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
          <Clock className="h-3 w-3" /> {article.readMinutes} min read
        </div>
      </motion.div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_200px]">
        {/* Article body */}
        <div>
          <Card className="p-6">
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
              className="prose prose-sm dark:prose-invert max-w-none"
            />
          </Card>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-display text-base font-semibold">Related articles</h2>
              <div className="space-y-2">
                {related.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => navigate(`/app/learn/${r.slug}`)}
                    className="flex w-full items-center justify-between rounded-md border border-border p-3 text-left hover:bg-surface-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-ink-muted">{r.readMinutes} min read</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-subtle" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TOC */}
        {headings.length > 0 && (
          <div className="hidden md:block">
            <div className="sticky top-24">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Contents</h3>
              <ul className="space-y-1">
                {headings.map((h, i) => {
                  const text = h.replace('## ', '')
                  return (
                    <li key={i}>
                      <a
                        href={`#${headingId(text)}`}
                        className="text-xs text-ink-muted hover:text-ink"
                      >
                        {text}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
