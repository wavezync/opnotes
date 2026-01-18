import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [tailwindcss(), react()],
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/renderer/index.html'),
          print: resolve(__dirname, 'src/renderer/print.html')
        }
      }
    }
  }
})
