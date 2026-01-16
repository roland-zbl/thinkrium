## 1. 類型與接口定義

- [x] 1.1 建立 `src/renderer/src/modules/feed/types.ts` 定義 `Feed` 和 `FeedItem` 型別
- [x] 1.2 在 `electron/preload.ts` 定義 `FeedAPI` 接口

---

## 2. 主進程實作

- [x] 2.1 建立 `electron/ipc/feed.ipc.ts`
- [x] 2.2 實作 `initFeedIPC()` 註冊處理器：
  - `feed:list` -> 回傳所有訂閱源
  - `feed:add` -> 新增訂閱源到資料庫
  - `feed:remove` -> 刪除訂閱源
  - `feed:items:list` -> 回傳特定訂閱源的文章
  - `feed:items:mark-read` -> 更新文章閱讀狀態
- [x] 2.3 在 `electron/main.ts` 調用 `initFeedIPC()`

---

## 3. 渲染進程實作

- [x] 3.1 建立 `src/renderer/src/modules/feed/services/feed.service.ts`
- [x] 3.2 封裝 `window.api.feed` 的非同步調用
- [x] 3.3 修改 `FeedList.tsx` 使用真實的服務讀取資料

---

## 4. 驗證

- [x] 4.1 使用 IPC 請求獲取資料並渲染
- [x] 4.2 驗證資料庫狀態隨 UI 操作正確變動
