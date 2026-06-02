import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import FeedbackButton from './components/FeedbackButton'
import MapView from './pages/MapView'
import ListView from './pages/ListView'
import AddLocation from './pages/AddLocation'
import LocationDetail from './pages/LocationDetail'
import Login from './pages/Login'
import FeedbackPage from './pages/Feedback'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/location/:id" element={<LocationDetail />} />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddLocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location/:id/edit"
            element={
              <ProtectedRoute>
                <AddLocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="p-8 text-center text-slate-500">
                Page not found.
              </div>
            }
          />
        </Routes>
      </main>
      <FeedbackButton />
    </div>
  )
}
