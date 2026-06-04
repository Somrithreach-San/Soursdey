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
    allowedHosts: ['0547-58-97-226-81.ngrok-free.app']
  }
})
