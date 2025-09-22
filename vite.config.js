import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sicic/',
  server: {
    host: true,         
    port: 5173,         
    open: false,        
    cors: true, 
    allowedHosts: true,
  }
})

