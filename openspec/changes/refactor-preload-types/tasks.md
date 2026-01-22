## 1. Analysis

- [ ] 1.1 盤點 `electron/preload.ts` 中所有 `any` 類型使用點
- [ ] 1.2 確認 `@shared/types` 已包含所有需要的類型定義

## 2. Implementation

- [ ] 2.1 更新 `preload.ts` 中 `feed` 命名空間的類型：
  - `addFeed(feed: any)` → `addFeed(feed: Omit<Feed, 'created_at'>)`
  - `updateFeed(id: string, updates: any)` → `updateFeed(id: string, updates: Partial<Feed>)`
  - `listItems(filter: any)` → `listItems(filter: ItemFilter)`
- [ ] 2.2 更新 `preload.ts` 中 `note` 命名空間的類型：
  - `save(input: any)` → `save(input: SaveNoteInput)`
  - `list(filter?: any)` → `list(filter?: NoteFilter)`
  - `update(id: string, updates: any)` → `update(id: string, updates: NoteUpdate)`
- [ ] 2.3 更新 `preload.ts` 中 `project` 命名空間的類型：
  - `create(project: any)` → `create(project: Omit<Project, 'id' | 'created_at'>)`
- [ ] 2.4 更新 `preload.ts` 中 `highlight` 與 `dialog` 命名空間的類型
- [ ] 2.5 更新 `env.d.ts` 中的 `Window.api` 類型聲明以匹配

## 3. Verification

- [ ] 3.1 執行 `npm run typecheck` 確認無類型錯誤
- [ ] 3.2 在 IDE 中驗證 `window.api.*` 的自動補全正常運作
- [ ] 3.3 執行 `npm run dev` 確認應用程式正常運行
