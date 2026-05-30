import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so assets resolve regardless of the repo-name casing in the
// GitHub Pages URL (https://an4zz.github.io/PR-Blog/). Safe here because the app
// uses a HashRouter, so the document is always served from the base directory.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
