import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { GLOSSARY } from '@/data/glossary'

const TERM_MAP = Object.fromEntries(GLOSSARY.map((g) => [g.term.toLowerCase(), g]))

/**
 * Inline term with a dotted-underline tooltip showing the glossary definition.
 * @param {{ term: string, children?: React.ReactNode }} props
 */
export function Term({ term, children }) {
  const entry = TERM_MAP[term.toLowerCase()]
  if (!entry) return <>{children || term}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="cursor-help border-b border-dotted border-ink-muted"
          tabIndex={0}
        >
          {children || term}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{entry.term}</p>
        <p className="mt-0.5 font-normal opacity-90">{entry.definition}</p>
      </TooltipContent>
    </Tooltip>
  )
}
