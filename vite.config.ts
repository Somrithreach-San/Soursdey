import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  //ngrok exposing tunnel
  server: {
    allowedHosts: ['ab77-58-97-226-82.ngrok-free.app']
  }
})
