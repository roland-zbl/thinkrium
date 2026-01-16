import { _electron as electron } from 'playwright';
import { test as base, Page, ElectronApplication } from '@playwright/test';
import path from 'path';

// Extend the test object with electronApp
export const test = base.extend<{ electronApp: ElectronApplication; page: Page; appDataPath: string }>({
  electronApp: async ({ }, use) => {
    // Determine the path to the main process
    // In dev, we can point to electron-vite's output or just run via electron
    // For simplicity in this env, we might want to run against the dev build or packaged app
    // Assuming dev mode for now:
    // We need to point to the directory containing package.json or main file

    // Check if we are in a CI environment or local.
    // In CI, we assume the app is built or we use `electron .`
    // Let's use `electron .` which uses the main entry point in package.json

    // Note: In a real headless CI with XVFB, this should work.

    const electronApp = await electron.launch({
      args: ['.'], // Run the current directory
      env: {
        ...process.env,
        NODE_ENV: 'test',
      }
    });

    await use(electronApp);

    await electronApp.close();
  },
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    await use(page);
  },
});

export { expect } from '@playwright/test';
