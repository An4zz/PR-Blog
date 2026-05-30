import { useParams } from 'react-router-dom'
import EntryForm from '../components/EntryForm'
import { useEntries } from '../hooks/useEntries'

/** Handles both creating (/add) and editing (/entry/:id/edit) an entry. */
export default function AddEntry() {
  const { id } = useParams()
  const { entries } = useEntries()
  const existing = id ? entries.find((e) => e.id === id) : undefined

  return (
    <div className="h-full overflow-y-auto">
      <EntryForm existing={existing} />
    </div>
  )
}
