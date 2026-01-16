import { test, expect } from '../fixtures/electron';
import { MockFeedServer } from '../fixtures/mock-server';

test.describe('Feed Workflow', () => {
  let mockServer: MockFeedServer;
  let feedUrl: string;

  test.beforeAll(async () => {
    mockServer = new MockFeedServer();
    feedUrl = await mockServer.start();
    console.log(`Mock server started at ${feedUrl}`);
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Add Subscription -> View Article -> Save as Note', async ({ page }) => {
    // 0. Navigate to Feed view first (app starts on Dashboard)
    await page.getByRole('button', { name: 'Feed' }).click();
    await page.waitForTimeout(500); // Wait for view to switch

    // 1. Add Subscription
    // Click the "新增" button in SubscriptionSidebar
    await page.getByRole('button', { name: /新增/i }).first().click();

    // Wait for Dialog
    await expect(page.getByText('新增 RSS 訂閱')).toBeVisible();

    // Fill URL
    await page.getByPlaceholder('https://example.com/feed.xml').fill(feedUrl);

    // Fill Name (Optional, but good for test stability)
    await page.getByPlaceholder('留空將自動抓取').fill('Test Feed');

    // Click Confirm (Button text: "確認新增")
    await page.getByRole('button', { name: '確認新增' }).click();

    // Wait for dialog to close and feed to appear
    await page.waitForTimeout(1000);

    // Verify Feed appears in the sidebar (use .first() to avoid multiple matches)
    await expect(page.getByText('Test Feed').first()).toBeVisible();

    // 2. View Article - the feed should already be selected after adding
    // Wait for items to load
    await page.waitForTimeout(500);

    // We expect "Test Article 1" to appear.
    await expect(page.getByText('Test Article 1')).toBeVisible();

    // Click the article to select it
    await page.getByText('Test Article 1').first().click();

    // Wait for preview to load
    await page.waitForTimeout(500);

    // 3. Save as Note
    // In FeedPreview.tsx, there is a button: "保存" or "編輯筆記".
    await page.getByRole('button', { name: '保存' }).click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify button changes to "編輯筆記" which implies saved state.
    await expect(page.getByRole('button', { name: '編輯筆記' })).toBeVisible();
  });
});
