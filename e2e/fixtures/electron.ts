import { _electron as electron } from 'playwright';
import { test as base, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Extend the test object with electronApp
export const test = base.extend<{ electronApp: ElectronApplication; page: Page; appDataPath: string }>({
  appDataPath: async ({}, use) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'electron-playwright-'));
    await use(tmpDir);
    // Cleanup
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },
  electronApp: async ({ appDataPath }, use) => {
    const electronApp = await electron.launch({
      args: [
        path.join(__dirname, '../../out/main/index.js'),
        `--user-data-dir=${appDataPath}`
      ],
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
