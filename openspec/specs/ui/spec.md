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

### Requirement: AppLayout Component

系統 SHALL 提供 AppLayout 組件作為三欄佈局容器。

#### Scenario: 基本佈局渲染

- **WHEN** AppLayout 組件被渲染
- **THEN** 顯示三欄結構：Sidebar（左）、主內容區（中）、AuxPanel（右）
- **AND** 使用 flexbox 佈局，主內容區彈性填充

---

### Requirement: Sidebar Component

系統 SHALL 提供 Sidebar 組件作為側邊欄導航。

#### Scenario: 導航項目渲染

- **WHEN** Sidebar 組件被渲染
- **THEN** 顯示主導航項目（首頁、Feed 等）
- **AND** 每個項目有圖標和文字

#### Scenario: Active 狀態

- **WHEN** 用戶點擊某導航項目
- **THEN** 該項目顯示 active 樣式（背景高亮）
- **AND** 其他項目恢復預設樣式

---

### Requirement: AuxPanel Component

系統 SHALL 提供 AuxPanel 組件作為輔助面板。

#### Scenario: 基本渲染

- **WHEN** AuxPanel 組件被渲染
- **THEN** 顯示在主內容區右側
- **AND** 寬度固定為 300px

### Requirement: Application Layout

The application SHALL provide a three-column layout with Sidebar, Main Content, and Auxiliary Panel.

#### Scenario: Normal layout state

- **WHEN** application is launched
- **THEN** Sidebar displays as 56px icon column
- **AND** Main Content fills remaining width
- **AND** Auxiliary Panel is 280px wide (collapsible)

#### Scenario: Sidebar expanded state

- **WHEN** user hovers over or clicks the Sidebar toggle
- **THEN** Sidebar expands to 200px
- **AND** displays navigation labels and project list

#### Scenario: Focus mode

- **WHEN** user triggers focus mode via keyboard shortcut
- **THEN** Sidebar and Auxiliary Panel are hidden
- **AND** Main Content takes 100% width

---

### Requirement: Navigation System

The application SHALL provide a Sidebar-based navigation system with 4 main entry points.

#### Scenario: Navigation items display

- **WHEN** user views the Sidebar
- **THEN** Dashboard, Feed, Library, Project icons are visible
- **AND** AI and Settings icons are visible below separator

#### Scenario: Navigation switching

- **WHEN** user clicks a navigation item
- **THEN** Main Content switches to corresponding view
- **AND** previous view state is preserved (scroll position, selection)

#### Scenario: View state persistence

- **WHEN** user scrolls in Feed view, switches to Library, then returns to Feed
- **THEN** Feed view scroll position is restored
- **AND** selected item is still selected

---

### Requirement: Tab System

The application SHALL provide a Tab Bar for Editor and ProjectPage tabs only.

#### Scenario: Tab creation

- **WHEN** user double-clicks a note in Library or clicks "Edit" in preview
- **THEN** an Editor Tab is created in Tab Bar
- **AND** Tab displays the note title

#### Scenario: Navigation views do not create tabs

- **WHEN** user clicks Dashboard, Feed, Library, or Project in Sidebar
- **THEN** no new Tab is created
- **AND** view is rendered directly in Main Content

#### Scenario: Tab close with unsaved changes

- **WHEN** user clicks close on a Tab with unsaved changes
- **THEN** confirmation dialog appears
- **AND** offers "Don't Save", "Save", "Cancel" options

#### Scenario: Last tab closed

- **WHEN** user closes the last Tab
- **THEN** Tab Bar is hidden
- **AND** current navigation view is displayed

### Requirement: Drag and Drop to Project

The application SHALL support dragging items to add them to projects.

#### Scenario: Drag Feed item to Project icon (collapsed)

- **WHEN** user drags a Feed item to the Project icon in collapsed Sidebar
- **THEN** a Popover appears showing project list
- **AND** user can select a project to save and add the item

#### Scenario: Drag Feed item to specific project (expanded)

- **WHEN** Sidebar is expanded and user drags a Feed item to a project name
- **THEN** item is saved as note and added to that project directly

#### Scenario: Drag note to project

- **WHEN** user drags a note from Library to a project in expanded Sidebar
- **THEN** note is added to that project's materials

---

### Requirement: Keyboard Shortcuts

The application SHALL support keyboard shortcuts for common operations.

#### Scenario: Global navigation shortcuts

- **WHEN** user presses Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+4
- **THEN** view switches to Dashboard, Feed, Library, Project respectively

#### Scenario: Feed shortcuts

- **WHEN** user presses S in Feed with item selected and input not focused
- **THEN** selected item is saved as note

#### Scenario: List navigation shortcuts

- **WHEN** user presses J or K in a list view
- **THEN** selection moves down or up respectively

#### Scenario: Shortcuts disabled in input

- **WHEN** user is typing in an input field or textarea
- **THEN** S, P, E shortcuts are disabled
- **AND** normal typing continues

---

### Requirement: Preview Panel

The application SHALL provide a split-view preview mechanism.

#### Scenario: Preview on single click

- **WHEN** user single-clicks an item in Feed, Library, or Project materials
- **THEN** right-side Preview Panel slides in from right
- **AND** displays item content

#### Scenario: Preview panel initially collapsed

- **WHEN** user enters Feed, Library, or Project view
- **THEN** Preview Panel is collapsed
- **AND** list takes full available width

#### Scenario: Close preview with Escape

- **WHEN** user presses Escape with Preview Panel open
- **THEN** Preview Panel collapses
- **AND** list regains full width

---

### Requirement: Data Refresh Mechanism

The application SHALL provide automatic and manual data refresh for Feed.

#### Scenario: Auto refresh on app launch

- **WHEN** application starts
- **THEN** all subscriptions are fetched automatically

#### Scenario: Auto refresh on view switch

- **WHEN** user switches to Feed view and last fetch was > 5 minutes ago
- **THEN** subscriptions are refreshed automatically

#### Scenario: Manual refresh button

- **WHEN** user clicks refresh button in Feed toolbar
- **THEN** current subscription is refreshed
- **AND** button shows spinning animation during refresh

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
