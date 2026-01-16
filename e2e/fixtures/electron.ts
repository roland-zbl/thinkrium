import { _electron as electron } from 'playwright';
import { test as base, Page, ElectronApplication } from '@playwright/test';
import path from 'path';

// Extend the test object with electronApp
export const test = base.extend<{ electronApp: ElectronApplication; page: Page }>({
  electronApp: async ({ }, use) => {
    // Determine the path to the main process entry point
    // After npm run build, the output is in out/main/index.js
    const mainPath = path.join(__dirname, '../../out/main/index.js');
    
    console.log('[E2E] Launching Electron with main:', mainPath);

    const electronApp = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Skip the setup dialog in test mode
        E2E_TESTING: 'true',
      }
    });

    // Wait for the first window to be ready
    const page = await electronApp.firstWindow();
    console.log('[E2E] First window ready, URL:', page.url());

    await use(electronApp);

    await electronApp.close();
  },
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    // Wait for the app to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});

export { expect } from '@playwright/test';
