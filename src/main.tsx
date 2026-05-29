import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './lib/leaflet' // side-effect: fixes default marker icons
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { EntriesProvider } from './hooks/useEntries'

// HashRouter is used so deep links and refreshes work on GitHub Pages without
// any 404 redirect trick (URLs look like /pr-blog/#/list).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <EntriesProvider>
          <App />
        </EntriesProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
)
