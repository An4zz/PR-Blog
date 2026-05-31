import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './lib/leaflet' // side-effect: fixes default marker icons
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { LocationsProvider } from './hooks/useLocations'

// HashRouter is used so deep links and refreshes work on GitHub Pages without
// any 404 redirect trick (URLs look like /pr-blog/#/list).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <LocationsProvider>
            <App />
          </LocationsProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
)
