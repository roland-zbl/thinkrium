import { defineConfig } from '@playwright/test'
import path from 'path'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  // Ensure we don't start the web server, as we are testing Electron app
  webServer: undefined,
  fullyParallel: false,
  workers: 1, // Electron tests usually run in a single worker to avoid conflicts
  reporter: 'html',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'electron',
      use: {
        // We will launch electron in the fixture
      },
    },
  ],
})
