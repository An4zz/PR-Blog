import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path must match the GitHub repo name so assets resolve on GitHub Pages
// (served from https://an4zz.github.io/pr-blog/).
// https://vite.dev/config/
export default defineConfig({
  base: '/pr-blog/',
  plugins: [react(), tailwindcss()],
})
