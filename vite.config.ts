import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This allows Vite to be accessed from network hosts, which is required for sandboxes.
    host: true,
    // This is needed for HMR (Hot Module Reload) to work correctly in some sandboxed environments like CodeSandbox.
    hmr: {
      clientPort: 443
    }
  }
})