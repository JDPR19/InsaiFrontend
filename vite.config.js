import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         
    port: 5173,         
    open: false,        
    cors: true , 
    allowedHosts: [
      '708b-128-1-218-181.ngrok-free.app' 
    ]     
  }
})

