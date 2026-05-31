import { useParams } from 'react-router-dom'
import LocationForm from '../components/LocationForm'
import { useLocations } from '../hooks/useLocations'

/** Handles creating a place (/add) and editing one (/location/:id/edit). */
export default function AddLocation() {
  const { id } = useParams()
  const { locations } = useLocations()
  const existing = id ? locations.find((l) => l.id === id) : undefined

  return (
    <div className="h-full overflow-y-auto">
      <LocationForm existing={existing} />
    </div>
  )
}
