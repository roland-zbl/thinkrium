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
    // 1. Add Subscription
    // Locate the "Add Feed" button (implied by design patterns or need to check FeedView.tsx)
    // Looking at AddSubscriptionDialog.tsx, it's a dialog. The button to open it is likely in SubscriptionSidebar or FeedView.
    // Assuming text match for "新增訂閱" or "Add Subscription".
    // I will try to find a button with "Plus" icon or "新增" text.

    // Attempt to open the dialog (This assumes the sidebar is visible)
    // The Sidebar usually has a + button or "新增訂閱" tooltip.
    await page.getByRole('button', { name: /新增/i }).first().click();

    // Wait for Dialog
    await expect(page.getByText('新增 RSS 訂閱')).toBeVisible();

    // Fill URL
    await page.getByPlaceholder('https://example.com/feed.xml').fill(feedUrl);

    // Fill Name (Optional, but good for test stability)
    await page.getByPlaceholder('留空將自動抓取').fill('Test Feed');

    // Click Confirm (Button text: "確認新增")
    await page.getByRole('button', { name: '確認新增' }).click();

    // Verify Feed appears in the list (Assuming SubscriptionSidebar lists it)
    await expect(page.getByText('Test Feed')).toBeVisible();

    // 2. View Article
    // Click the feed in the sidebar
    await page.getByText('Test Feed').click();

    // Wait for items to load.
    // The items are in FeedItemList.tsx, rendered as FeedItemCard.
    // We expect "Test Article 1" to appear.
    await expect(page.getByText('Test Article 1')).toBeVisible();

    // Click the article to select it
    await page.getByText('Test Article 1').click();

    // 3. Save as Note
    // In FeedPreview.tsx, there is a button: "保存" or "編輯筆記".
    // It has a Bookmark icon.
    await page.getByRole('button', { name: '保存' }).click();

    // Verify button changes to "編輯筆記" which implies saved state.
    await expect(page.getByRole('button', { name: '編輯筆記' })).toBeVisible();
  });
});
