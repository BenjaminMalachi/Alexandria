import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  server: {
    // Listen on all network interfaces and use the PORT environment variable
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  },
})
