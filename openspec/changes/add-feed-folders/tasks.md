# Tasks: Add Feed Folders

## 1. 資料庫結構

### 1.1 新增 Folders 表
- [ ] 1.1.1 在 `electron/database.ts` 新增 `folders` 表：
  ```sql
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
  )
  ```
- [ ] 1.1.2 修改 `feeds` 表新增 `folder_id` 欄位（允許 NULL，無資料夾）
- [ ] 1.1.3 加入資料庫遷移邏輯（處理既有資料）

---

## 2. 後端服務

### 2.1 Folder Service
- [ ] 2.1.1 新增 `electron/services/folder.service.ts`
- [ ] 2.1.2 實現 `createFolder(name, parentId?)`: 建立資料夾
- [ ] 2.1.3 實現 `renameFolder(id, newName)`: 重新命名
- [ ] 2.1.4 實現 `deleteFolder(id)`: 刪除資料夾（訂閱移至根層級）
- [ ] 2.1.5 實現 `moveFolder(id, newParentId, position)`: 移動資料夾
- [ ] 2.1.6 實現 `getAllFolders()`: 取得資料夾樹狀結構

### 2.2 Feed Service 修改
- [ ] 2.2.1 `getAllFeeds()` 回傳包含 `folder_id`
- [ ] 2.2.2 新增 `moveFeedToFolder(feedId, folderId)`: 移動訂閱到資料夾
- [ ] 2.2.3 新增 `getFeedsByFolder(folderId)`: 取得資料夾下所有訂閱

### 2.3 IPC 橋接
- [ ] 2.3.1 新增 `folder.ipc.ts` (或擴展 `feed.ipc.ts`)
- [ ] 2.3.2 暴露所有 folder CRUD 操作
- [ ] 2.3.3 在 `preload/index.ts` 暴露 `window.api.folder.*`

---

## 3. 前端 Store

### 3.1 Folder State
- [ ] 3.1.1 在 `feed.store.ts` 新增 `folders: Folder[]` 狀態
- [ ] 3.1.2 新增 `fetchFolders()` action
- [ ] 3.1.3 新增 `createFolder()`, `renameFolder()`, `deleteFolder()` actions
- [ ] 3.1.4 新增 `moveFeedToFolder()` action
- [ ] 3.1.5 新增 `activeFolderId` 狀態（用於篩選）

---

## 4. 前端 UI

### 4.1 資料夾樹狀結構
- [ ] 4.1.1 新增 `FolderNode.tsx` 元件（可摺疊、顯示未讀數）
- [ ] 4.1.2 修改 `SubscriptionSidebar.tsx` 為樹狀結構渲染
- [ ] 4.1.3 實現摺疊/展開狀態（localStorage 持久化）

### 4.2 資料夾管理
- [ ] 4.2.1 資料夾右鍵選單：重新命名、刪除
- [ ] 4.2.2 訂閱右鍵選單：移動到資料夾
- [ ] 4.2.3 新增資料夾按鈕（於側邊欄標題區）

### 4.3 拖放功能 (Optional Enhancement)
- [ ] 4.3.1 使用 `@dnd-kit/core` 實現訂閱拖放到資料夾
- [ ] 4.3.2 實現資料夾排序拖放

---

## 5. 驗證與測試

- [ ] 5.1 手動測試：建立/重新命名/刪除資料夾
- [ ] 5.2 手動測試：移動訂閱到資料夾
- [ ] 5.3 手動測試：資料夾未讀數累計正確
- [ ] 5.4 手動測試：摺疊狀態刷新後保持
- [ ] 5.5 OPML 匯入時保留資料夾結構
