# Change: Add Feed Folders (Subscription Organization)

## Why

當訂閱數量增加時，扁平化的分類列表難以有效組織內容。成熟的 RSS 閱讀器（Readwise Reader、Inoreader）都支援資料夾結構來組織訂閱源。

目前的「分類」是單層結構，無法進行拖放重組，也無法摺疊/展開。

## What Changes

### 1. 資料夾資料模型
- 新增 `folders` 表儲存資料夾結構
- 支援資料夾嵌套（parent_id）
- feeds 表新增 `folder_id` 外鍵

### 2. 資料夾管理 UI
- 側邊欄支援資料夾節點顯示
- 資料夾可摺疊/展開
- 右鍵選單：新增資料夾、重新命名、刪除
- 拖放排序和移動訂閱

### 3. 資料夾篩選
- 點擊資料夾時顯示其下所有訂閱的文章
- 未讀數累計顯示

## Impact

- **Affected Specs**: `feed`
- **Affected Code**:
    - `electron/database.ts` (Schema update)
    - `electron/services/feed.service.ts` (Folder CRUD)
    - `src/renderer/src/modules/feed/store/feed.store.ts` (Folder state)
    - `src/renderer/src/modules/feed/components/SubscriptionSidebar.tsx` (Tree UI)
    - `src/renderer/src/modules/feed/components/FolderNode.tsx` (New)
