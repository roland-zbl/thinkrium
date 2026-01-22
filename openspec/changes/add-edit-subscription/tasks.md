## 1. Backend Implementation

- [ ] 1.1 Add `updateFeed(id, updates)` method to `feed.service.ts`:
  ```typescript
  updateFeed(feedId: string, updates: { title?: string; url?: string; folder_id?: string | null }): void
  ```
- [ ] 1.2 Add `getFeed(id)` method to `feed.service.ts` to retrieve single feed details
- [ ] 1.3 Register IPC handlers in `feed.ipc.ts`:
  - `feed:update` - Update feed properties
  - `feed:get` - Get single feed by ID
- [ ] 1.4 Expose new IPC methods in `preload.ts` under `window.api.feed`

## 2. Frontend Store

- [ ] 2.1 Add `updateFeed` action to `subscriptions.slice.ts`
- [ ] 2.2 Add `getFeed` action to retrieve subscription details for editing
- [ ] 2.3 Re-fetch subscriptions after successful update

## 3. UI Components

- [ ] 3.1 Create `EditSubscriptionDialog.tsx` with:
  - Name input (pre-filled with current name)
  - URL input (pre-filled with current URL)
  - Folder dropdown selector
  - Save and Cancel buttons
  - Use Radix Dialog component
- [ ] 3.2 Add "編輯" (Edit) option to `SubscriptionSidebar.tsx` dropdown menu
- [ ] 3.3 Add "編輯" option to `FolderNode.tsx` subscription dropdown menu
- [ ] 3.4 Wire up dialog open/close state management

## 4. Testing

- [ ] 4.1 Add test case for `updateFeed` in `feed.service.test.ts`
- [ ] 4.2 Manually test editing name, URL, and folder assignment
- [ ] 4.3 Verify feed list updates correctly after save
