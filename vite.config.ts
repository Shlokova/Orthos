import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const resolveSource = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolveSource('./src/app'),
      '@pages': resolveSource('./src/pages'),
      '@widgets': resolveSource('./src/widgets'),
      '@features': resolveSource('./src/features'),
      '@entities': resolveSource('./src/entities'),
      '@shared': resolveSource('./src/shared'),
    },
  },
})
