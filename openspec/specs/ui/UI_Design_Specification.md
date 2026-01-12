# Knowledge Base - UI 設計需求文件 v7

> **Dock + Tab 混合佈局架構**  
> 更新於 2025-12-25

---

## 設計理念

採用 **Global Dock (導航)** + **Tab System (多工)** + **Local Sidebar (上下文)** 的混合佈局：

| 元素                      | 設計原則                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| **Global Sidebar (Dock)** | **全域導航**：預設收合為圖標欄 (~50px)，節省空間，隨時可用             |
| **Tab Bar**               | **多工切換**：瀏覽器式分頁，支持同時打開多個上下文 (RSS / 筆記 / 設定) |
| **Local Sidebar**         | **上下文導航**：跟隨 Tab 內容變化的側欄 (如訂閱源列表)，可獨立收合     |
| **Main Content**          | **內容專注**：最大化內容區域，支援三欄或全屏閱讀                       |

---

## 整體佈局架構

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Tab Bar (類似瀏覽器分頁)                        │
│  [📰 收集: 全部] [📝 筆記: 遊戲設計 ✕] [+]               [🔍] [⚙️]      │
├──────┬─────────────────────────────────────────────────────────────────┤
│      │                                                                 │
│ Dock │                      Current Tab Content                        │
│      │                                                                 │
│ 📚   │  ┌──────────────┬──────────────────┬─────────────────────────┐  │
│      │  │ Local Sidebar│    List Area     │      Detail Area        │  │
│ 📥   │  │  (可收合)    │    (可調整)      │       (彈性寬度)        │  │
│ 📰   │  │              │                  │                         │  │
│ 📝   │  │  訂閱源      │    文章列表      │       文章內容          │  │
│ 📅   │  │  目錄樹      │    筆記列表      │       編輯器            │  │
│      │  │              │                  │                         │  │
│ ⭐   │  └──────────────┴──────────────────┴─────────────────────────┘  │
│ 🕐   │                                                                 │
│      │                                                                 │
│ ⚙️   │                                                                 │
│      │                                                                 │
│ 52px │                       flexible                                  │
└──────┴─────────────────────────────────────────────────────────────────┘
```

---

## 核心區域詳解

### 1. Global Sidebar (Dock)

**職責**：全域功能入口，類似 VS Code 的 Activity Bar 或 MacOS Dock。

- **寬度**：固定 52px (Icon only)，Hover 或點擊展開按鈕可擴展至 200px (Icon + Label)。
- **內容**：
  - `Top`：Logo, 收件匣, 收集(Feed), 知識庫(Note), 日記(Calendar), 圖譜(Graph)
  - `Bottom`：收藏, 最近, 設定, 主題切換

**交互**：

- 點擊圖標 → **切換到對應功能的 Tab** (如果已開則跳轉，未開則新建)。
- 拖拽圖標 → 可自定義排序。

---

### 2. Tab Bar System

**職責**：多工管理容器。

- **行为**：
  - 作為 `Main Content` 的容器。
  - 每個 Tab 擁有獨立的狀態（Scroll position, Local sidebar state, etc.）。
- **Tab 類型**：
  - **App Tab**：功能模組入口（如「收集」、「知識庫」），通常常駐或釘選。
  - **Item Tab**：具體項目（如「某篇筆記」、「某個 RSS 文章」），臨時打開，可隨時關閉。

---

### 3. Module Layouts (Tab 內容)

每個模組在 Tab 內部定義自己的佈局，通常包含一個 **可收合的 Local Sidebar**。

#### 3.1 Feed 模組 (收集)

```
┌──────────────┬────────────────────┬─────────────────────────────────┐
│ Local Sidebar│     List Area      │          Detail Area            │
│ (訂閱源)      │     (文章列表)     │          (文章預覽)             │
│              │                    │                                 │
│ [全部]       │ ┌────────────────┐ │ 《文章標題》                     │
│ [未讀]       │ │ 文章卡片 1     │ │                                 │
│ [已保存]     │ │ 標題 / 摘要    │ │ 正文內容...                     │
│ ────────     │ └────────────────┘ │                                 │
│ 📂 訂閱源    │ ┌────────────────┐ │ [圖片]                          │
│  ├ 游戏大观   │ │ 文章卡片 2     │ │                                 │
│  ├ GameLook  │ │                │ │ 更多內容...                     │
│  └ ...       │ └────────────────┘ │                                 │
│              │                    │ [保存筆記] [查看原文] [標記已讀] │
│ 200px (可收) │ 280px (可調整)     │ flexible                        │
└──────────────┴────────────────────┴─────────────────────────────────┘
```

#### 3.2 Note 模組 (知識庫)

```
┌──────────────┬────────────────────┬─────────────────────────────────┐
│ Local Sidebar│     List Area      │          Editor Area            │
│ (目錄/標籤)   │     (筆記列表)     │         (編輯器/預覽)           │
│              │                    │                                 │
│ 🔍 搜索...   │ ┌────────────────┐ │ # 筆記標題                       │
│              │ │ 筆記卡片 1     │ │                                 │
│ [全部]       │ │ 標題 / 日期    │ │ Markdown 編輯區域               │
│ [最近]       │ └────────────────┘ │ 或                              │
│ ────────     │ ┌────────────────┐ │ Markdown 渲染預覽               │
│ 🏷️ 標籤      │ │ 筆記卡片 2     │ │                                 │
│  ├ #遊戲 (12)│ │                │ │                                 │
│  ├ #AI (8)   │ └────────────────┘ │                                 │
│  └ ...       │                    │ ────────────────────────────    │
│ ────────     │                    │ 元數據面板（可摺疊）             │
│ 📁 資料夾    │                    │                                 │
│  ├ 2024/12   │                    │ [編輯] [刪除] [查看原文]         │
│  └ ...       │                    │                                 │
│ 200px (可收) │ 280px (可調整)     │ flexible                        │
└──────────────┴────────────────────┴─────────────────────────────────┘
```

---

### 4. 響應式策略 (解決擠壓問題)

1.  **Global Dock 收合**：預設收合 (52px)，釋放 150px+ 空間。
2.  **Local Sidebar 收合**：
    - 當用戶專注閱讀/編輯時，可收起 Local Sidebar。
    - 小螢幕 (< 1024px) 下，Local Sidebar 自動轉為 Drawer (抽屜式覆蓋)。
3.  **列表區收合 (Zen Mode)**：
    - 極致專注模式下，可收起列表區，只保留內容編輯器（全屏模式）。

---

### 4. AI Panel（右側抽屜，可選）

```
                                                    ┌──────────────────┐
                                                    │ 💬 AI 助手    ✕  │
                                                    ├──────────────────┤
                                                    │                  │
                                                    │ 🤖 這篇文章主要   │
                                                    │    討論了...      │
                                                    │                  │
                                                    │ 👤 幫我總結       │
                                                    │                  │
                                                    ├──────────────────┤
                                                    │ [輸入...] [發送] │
                                                    └──────────────────┘
```

---

## 組件結構

```
App.tsx
├── AppShell
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavSection (收件匣/收集)
│   │   ├── KnowledgeSection (知識庫/日記/圖譜)
│   │   ├── QuickAccessSection (收藏/最近)
│   │   └── SettingsSection
│   │
│   ├── TabBar
│   │   ├── Tab × N (可拖拽排序)
│   │   ├── NewTabButton
│   │   └── QuickActions (搜索/AI/設定)
│   │
│   ├── MainContent
│   │   ├── NoteEditor (筆記編輯)
│   │   ├── FeedView (RSS 三欄)
│   │   ├── NoteListView (筆記列表)
│   │   ├── CalendarView (日曆)
│   │   └── GraphView (圖譜)
│   │
│   └── AIPanel (Sheet, 右側抽屜)
│
└── Modals
    ├── SearchModal (Cmd+K)
    └── SettingsModal
```

---

## 狀態管理

```typescript
interface AppState {
  // Tab 系統
  tabs: Tab[]
  activeTabId: string
  addTab: (tab: Tab) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // AI Panel
  aiPanelOpen: boolean
  toggleAIPanel: () => void
}

interface Tab {
  id: string
  type: 'note' | 'article' | 'list' | 'calendar' | 'graph' | 'settings'
  title: string
  icon: string
  pinned: boolean
  data: {
    noteId?: string
    articleId?: string
    listFilter?: { tag?: string; folder?: string }
    // ...
  }
}
```

---

## 開發計劃（更新）

### Phase 1：Tab 系統架構

- [ ] 創建 `TabBar` 組件（支持拖拽、釘選）
- [ ] 創建 `Tab` 狀態管理
- [ ] 重構 `Sidebar` 為導航中心
- [ ] 實現基礎 Tab 切換邏輯

### Phase 2：內容視圖

- [ ] 筆記編輯器（Tab 內）
- [ ] RSS 收集視圖（三欄式）
- [ ] 筆記列表視圖

### Phase 3：擴展功能

- [ ] 日曆視圖
- [ ] 圖譜視圖
- [ ] AI Panel

---

## 技術框架

| 類別     | 選擇            |
| -------- | --------------- |
| UI 框架  | Shadcn/ui       |
| 樣式     | Tailwind CSS v3 |
| 圖標     | Lucide Icons    |
| 拖拽     | @dnd-kit/core   |
| 狀態管理 | Zustand         |

---

## 快捷鍵

| 快捷鍵      | 功能              |
| ----------- | ----------------- |
| `Cmd + K`   | 全局搜索          |
| `Cmd + N`   | 新建筆記          |
| `Cmd + T`   | 新建 Tab          |
| `Cmd + W`   | 關閉當前 Tab      |
| `Cmd + 1-9` | 切換到第 N 個 Tab |
| `Cmd + J`   | 切換 AI Panel     |
| `Cmd + B`   | 切換 Sidebar      |
| `Cmd + ,`   | 設定              |
