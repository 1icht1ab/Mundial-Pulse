import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mundial Pulse — dev server en :5190 para no chocar con
// licht-labor (:8030) ni ChowPulse (:5180) del mismo workspace.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    host: true,
  },
})
