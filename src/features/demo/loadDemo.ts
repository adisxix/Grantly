import { useProfileStore } from '@/store/useProfileStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEssayStore } from '@/store/useEssayStore'
import { loadDemoData } from '@/data/demo'
import { toast } from 'sonner'

/**
 * Load all demo data into the stores in one go.
 */
export function loadDemo() {
  const { profile, applications, documents, essays } = loadDemoData()
  useProfileStore.getState().setProfile(profile)
  useApplicationStore.getState().setApplications(applications)
  documents.forEach((d) => useDocumentStore.getState().addDemoDocument(d))
  essays.forEach((e) => {
    const existing = useEssayStore.getState().essays.find((x) => x.id === e.id)
    if (!existing) useEssayStore.getState().createEssay(e)
  })
  toast.success('Demo data loaded', { description: 'Explore Grantly with sample scholarships and applications.' })
}
