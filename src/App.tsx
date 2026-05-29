import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import MapView from './pages/MapView'
import ListView from './pages/ListView'
import AddEntry from './pages/AddEntry'
import EntryDetail from './pages/EntryDetail'
import Login from './pages/Login'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/entry/:id" element={<EntryDetail />} />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entry/:id/edit"
            element={
              <ProtectedRoute>
                <AddEntry />
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
    </div>
  )
}
