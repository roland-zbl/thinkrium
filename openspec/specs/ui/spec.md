# UI 模組規格

## Purpose

UI 模組定義應用程式的視覺設計系統和佈局組件，確保一致的使用者體驗。

---

## Requirements

### Requirement: Three-Column Layout

系統 SHALL 提供三欄式佈局作為主要介面結構。

#### Scenario: 基本佈局

- **WHEN** 應用程式載入完成
- **THEN** 顯示三欄佈局：
  - 左側：側邊欄（Sidebar, 240px）
  - 中間：主內容區（Main Content, 彈性寬度）
  - 右側：輔助面板（Aux Panel, 可選，300px）

#### Scenario: 響應式行為

- **WHEN** 視窗寬度小於 900px
- **THEN** 輔助面板自動隱藏
- **WHEN** 視窗寬度小於 700px
- **THEN** 側邊欄可手動收合

---

### Requirement: Dark Theme

系統 SHALL 支援深色主題作為預設主題。

#### Scenario: 色彩系統

- **WHEN** 應用程式啟動
- **THEN** 使用深色主題配色：
  - 背景：`#0d0d0d`（Base）至 `#1a1a1a`（Raised）
  - 文字：`#ffffff`（Primary）至 `rgba(255,255,255,0.6)`（Secondary）
  - 強調色：`#4fc3f7`（Accent）

---

### Requirement: Navigation Sidebar

系統 SHALL 提供側邊欄導航。

#### Scenario: 導航項目

- **WHEN** 側邊欄顯示
- **THEN** 包含主要導航項目（首頁、Feed、筆記等）
- **AND** 顯示訂閱源分類/列表

#### Scenario: Active 狀態

- **WHEN** 用戶點擊某個導航項目
- **THEN** 該項目顯示 active 狀態（背景高亮）
- **AND** 主內容區切換到對應視圖

---

### Requirement: Card Component

系統 SHALL 提供統一的卡片組件樣式。

#### Scenario: 卡片基礎樣式

- **WHEN** 顯示內容卡片
- **THEN** 具有圓角邊框（8px）
- **AND** 具有細邊框（1px, rgba(255,255,255,0.1)）
- **AND** 具有微妙的背景色（#1a1a1a）

#### Scenario: 卡片交互狀態

- **WHEN** 滑鼠懸停在卡片上
- **THEN** 邊框顏色變為強調色（#4fc3f7）
- **AND** 可選：輕微上浮陰影效果

---

### Requirement: Filter Pills

系統 SHALL 提供藥丸式篩選標籤。

#### Scenario: 篩選標籤顯示

- **WHEN** 顯示篩選區域
- **THEN** 以水平排列的藥丸標籤顯示選項（全部、未讀、已讀等）

#### Scenario: 篩選標籤切換

- **WHEN** 用戶點擊某個篩選標籤
- **THEN** 該標籤切換為 active 狀態（背景填充強調色）
- **AND** 內容列表根據篩選條件更新

---

## Design Tokens

### 顏色

```css
:root {
  /* 背景 */
  --color-bg-base: #0d0d0d;
  --color-bg-raised: #1a1a1a;
  --color-bg-elevated: #242424;

  /* 文字 */
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  --color-text-muted: rgba(255, 255, 255, 0.4);

  /* 強調色 */
  --color-accent: #4fc3f7;
  --color-accent-hover: #81d4fa;

  /* 邊框 */
  --color-border: rgba(255, 255, 255, 0.1);
  --color-border-hover: var(--color-accent);
}
```

### 間距

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 圓角

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## 組件清單

### 佈局組件

| 組件        | 職責         | 狀態   |
| ----------- | ------------ | ------ |
| `AppLayout` | 三欄佈局容器 | 待建立 |
| `Sidebar`   | 側邊欄       | 待建立 |
| `AuxPanel`  | 輔助面板     | 待建立 |

### 基礎組件（現有）

| 組件          | 職責          | 狀態     |
| ------------- | ------------- | -------- |
| `FeedHeader`  | Feed 頁面標題 | ✅ 已建立 |
| `FeedFilters` | 篩選標籤      | ✅ 已建立 |
| `FeedList`    | 內容列表      | ✅ 已建立 |
| `FeedCard`    | 內容卡片      | ✅ 已建立 |
