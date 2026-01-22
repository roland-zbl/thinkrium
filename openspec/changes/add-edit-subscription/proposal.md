# Change: Add Edit Subscription Functionality

## Why

Users cannot currently edit subscription sources after adding them. This is a critical missing feature that requires users to delete and re-add subscriptions to make any changes.

## What Changes

- Create `EditSubscriptionDialog.tsx` component for editing subscription details
- Add `updateFeed` method to feed service and IPC handlers
- Add `updateFeed` action to subscriptions slice
- Add "Edit" option to subscription context menus in sidebar and folder nodes

## Impact

- Affected specs: feed
- Affected code:
  - `electron/services/feed.service.ts`
  - `electron/ipc/feed.ipc.ts`
  - `electron/preload.ts`
  - `src/renderer/src/modules/feed/store/slices/subscriptions.slice.ts`
  - `src/renderer/src/modules/feed/components/SubscriptionSidebar.tsx`
  - `src/renderer/src/modules/feed/components/FolderNode.tsx`
  - `src/renderer/src/modules/feed/components/EditSubscriptionDialog.tsx` [NEW]
