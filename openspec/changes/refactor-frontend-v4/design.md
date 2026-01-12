## Context

本次重構旨在將前端架構對齊產品架構 v4。現有程式碼基於較早的設計，與最新規劃有顯著差異。

### Constraints

- 後端基礎設施（Electron/SQLite/IPC）維持不變
- 保留 TailwindCSS + Radix UI 技術棧
- 必須支援 Mock 資料開發，IPC API 可後補

### Stakeholders

- Product Owner: Roland
- Architecture: Antigravity (Gemini Pro)
- Implementation: Gemini Flash

---

## Goals / Non-Goals

### Goals

- 建立符合 v4 架構的 UI 框架
- 確保可維護性（組件分層、模塊邊界、Design Tokens）
- 確保可擴展性（新增模塊只需 5 步）
- 完成可運行的界面原型

### Non-Goals

- 完整的 Editor 功能（Phase 2）
- 日曆/標籤雲視圖細節（Phase 2）
- 無障礙設計（暫不納入）
- AI 推薦系統（暫不納入）

---

## Decisions

### D1: 視圖狀態保持策略

**Decision**: 使用 `display: none` 而非條件渲染

**Rationale**:

- 組件不卸載，滾動位置自動保持
- 無需手動恢復狀態
- 對於 4 個視圖，記憶體影響可接受

**Alternatives Considered**:

- 條件渲染 + Zustand 手動恢復：增加複雜度，容易出錯

---

### D2: 拖曳選擇器

**Decision**: 使用 Radix Popover 作為拖曳目標選擇器

**Rationale**:

- 比 Modal 更輕量
- 直接出現在放置目標旁邊
- 用戶操作路徑更短

---

### D3: 虛擬滾動

**Decision**: Feed/Library 列表使用 `@tanstack/react-virtual`

**Rationale**:

- 需求：1000+ 項目不卡頓
- 該套件輕量、維護良好、與 React 整合度高

---

### D4: 鍵盤快捷鍵

**Decision**: 使用 `react-hotkeys-hook`

**Rationale**:

- API 簡潔，支援 `enabled` 條件
- 可輕鬆處理「輸入框 focus 時禁用」需求

---

## Risks / Trade-offs

| Risk                | Impact           | Mitigation                     |
| ------------------- | ---------------- | ------------------------------ |
| 現有 IPC API 不足   | 前端開發受阻     | Mock 資料優先開發，API 後補    |
| 重構範圍大          | 開發時間長       | 分階段執行，每階段有明確驗證點 |
| display:none 記憶體 | 多視圖佔用記憶體 | 監控記憶體使用，必要時優化     |

---

## Migration Plan

### 資料遷移

- 無需資料遷移（後端不變）

### 程式碼遷移

1. 備份現有 `useTabStore.ts`
2. 刪除舊模塊目錄
3. 建立新目錄結構
4. 逐模塊實作

### 回滾方案

- Git 分支開發，未合併前可隨時放棄
- 舊程式碼保留在 Git 歷史

---

## Open Questions

1. ~~Editor 使用現有還是新建？~~ → Phase 2，暫不處理
2. ~~Project 模塊的 IPC API 何時實作？~~ → 前端先用 Mock
