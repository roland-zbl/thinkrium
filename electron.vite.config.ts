import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['fast-xml-parser'] })],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        'fast-xml-parser': require.resolve('fast-xml-parser')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@electron-toolkit/preload'] })],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
