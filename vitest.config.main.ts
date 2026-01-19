import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'main',
    root: '.',
    include: ['src/main/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    environment: 'node',
    setupFiles: ['./tests/setup/main-setup.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    // Skip tests that require native modules in CI
    // These tests are designed to run with a properly built Electron environment
    typecheck: {
      enabled: false
    },
    coverage: {
      provider: 'v8',
      include: ['src/main/**/*.ts'],
      exclude: ['src/main/**/*.d.ts', 'src/main/db/migrations/**']
    }
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared')
    }
  }
})
