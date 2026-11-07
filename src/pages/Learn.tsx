import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, BookOpen, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { ARTICLES } from '@/data/articles'
import { GLOSSARY } from '@/data/glossary'

export default function Learn() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))]
  }, [])

  const filtered = useMemo(() => {
    let results = ARTICLES
    if (activeCategory !== 'All') {
      results = results.filter((a) => a.category === activeCategory)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q),
      )
    }
    return results
  }, [query, activeCategory])

  return (
    <div className="mx-auto max-w-content space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles"><BookOpen className="h-4 w-4" /> Articles</TabsTrigger>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
        </TabsList>

        {/* Articles */}
        <TabsContent value="articles">
          {/* Category chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300'
                    : 'border-border text-ink-muted hover:bg-surface-2'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen className="h-8 w-8" />} title="No articles found" description="Try a different search or category." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button onClick={() => navigate(`/app/learn/${article.slug}`)} className="text-left">
                    <Card className="flex h-full flex-col p-4">
                      <Badge variant="jade" className="w-fit text-[10px]">{article.category}</Badge>
                      <h3 className="mt-2 font-display text-base font-semibold">{article.title}</h3>
                      <p className="mt-1 flex-1 text-sm text-ink-muted line-clamp-3">{article.excerpt}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-ink-subtle">
                        <Clock className="h-3 w-3" /> {article.readMinutes} min read
                      </div>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary">
          <Card className="p-4">
            <div className="space-y-2">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="border-b border-border pb-2 last:border-0">
                  <h3 className="text-sm font-semibold">{g.term}</h3>
                  <p className="text-sm text-ink-muted">{g.definition}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
