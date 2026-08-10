import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force Vite restart for node_modules cache invalidation
export default defineConfig({
  plugins: [react()],
})
