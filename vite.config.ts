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
    allowedHosts: ['a7f5-96-9-69-195.ngrok-free.app']
  }
})
