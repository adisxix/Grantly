import { useEffect } from 'react'

/**
 * Set the document title for the current route.
 * @param {string} title
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Grantly` : 'Grantly — Find it. Fit it. Fund it.'
    return () => {
      document.title = 'Grantly — Find it. Fit it. Fund it.'
    }
  }, [title])
}
