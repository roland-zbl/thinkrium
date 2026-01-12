# Change: 實作 Feed 模組 IPC 橋接

## Why

為了讓渲染進程（React）能夠與主進程（SQLite）進行資料交互，我們需要建立一個安全的 IPC 橋接機制。這將允許：
- 用戶在 UI 上新增或移除 RSS 訂閱源
- 從資料庫載入訂閱列表和文章
- 更新文章的閱讀狀態（已讀/未讀）

## What Changes

- **[MODIFY]** `electron/preload.ts`: 透過 `contextBridge` 暴露 Feed API。
- **[NEW]** `electron/ipc/feed.ipc.ts`: 實作主進程的 IPC 處理器，直接操作 SQLite 資料庫。
- **[MODIFY]** `electron/main.ts`: 註冊 Feed IPC 處理器。
- **[NEW]** `src/renderer/src/modules/feed/services/feed.service.ts`: 在渲染進程提供型別安全的 API 調用封裝。
- **[NEW]** `src/renderer/src/modules/feed/types.ts`: 定義共用的資料型別。

## Impact

- **Affected specs**: `feed`, `core`
- **Affected code**: 
  - `electron/preload.ts`
  - `electron/main.ts`
  - `electron/ipc/`
  - `src/renderer/src/modules/feed/`
- **Breaking changes**: 無

## Success Criteria

- [ ] 渲染進程可以成功調用 `window.api.feed.listFeeds()` 並獲取資料庫中的資料
- [ ] 在 UI 執行的「標記已讀」操作能正確更新 SQLite 內部的狀態
- [ ] 模擬數據被替換為從資料庫獲取的真實數據
