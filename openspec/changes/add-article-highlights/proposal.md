# Change: Add Article Highlights & Annotations

## Why

Readwise Reader 的核心價值在於「主動閱讀」— 允許用戶在文章中標記重點（Highlight）並添加筆記。這是與被動閱讀的根本區別。

目前 Thinkrium 只支援「保存為筆記」，但無法在閱讀過程中標記片段或添加 inline 註解。

## What Changes

### 1. Highlight 標記功能
- 選取文字後顯示 Highlight 工具列
- 支援多種顏色（黃、綠、藍、粉）
- Highlight 資料同步保存到資料庫

### 2. Annotation 註解功能
- Highlight 後可添加筆記
- 筆記以 tooltip 或側邊面板顯示

### 3. Highlights 管理
- 保存的 Highlight 可在 Library 模塊查看
- 支援匯出 Highlight 為 Markdown

## Impact

- **Affected Specs**: `feed`
- **Affected Code**:
    - `electron/database.ts` (highlights table)
    - `electron/services/highlight.service.ts` (New)
    - `src/renderer/src/modules/feed/components/FeedPreview.tsx` (Selection handling)
    - `src/renderer/src/modules/feed/components/HighlightToolbar.tsx` (New)
    - `src/renderer/src/modules/feed/components/HighlightedText.tsx` (New)
