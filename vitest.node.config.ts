import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['electron/__tests__/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'out', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'out', 'dist', '**/*.d.ts', '**/__tests__/**']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/renderer/src')
    }
  }
})
