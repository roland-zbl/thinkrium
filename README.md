# Thinkrium

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**Thinkrium** 是一個基於 Electron + React + TypeScript 構建的桌面應用程式，旨在成為您的「第二大腦 (Second Brain)」個人知識管理系統。

## 📖 專案概述 (Project Overview)

**願景**：提供一個整合且高效的環境，讓知識工作者、研究人員與內容創作者能夠輕鬆地獲取、整理與連結知識。Thinkrium 強調「本地優先 (Local First)」，確保您的資料掌握在自己手中。

**目標受眾**：
- **知識工作者**：需要高效整理大量資訊的專業人士。
- **研究人員**：需要追蹤多個來源並建立筆記關聯的學者或學生。
- **內容創作者**：需要從各種 RSS 訂閱源獲取靈感並進行創作的人。

## ✨ 主要功能 (Features)

- **RSS/Atom 訂閱源管理**：支援訂閱並在後台自動獲取最新的 RSS/Atom 文章，將外部知識流整合至您的工作區。
- **筆記管理與雙向連結**：強大的筆記編輯器，支援 Markdown 語法，並允許筆記之間建立雙向連結，構建網狀知識庫。
- **專案管理 (Project Management)**：提供直觀的拖放 (Drag-and-Drop) 介面來組織與管理您的專案與相關資源。
- **全文檢索 (Full-text Search)**：利用 SQLite 的 FTS5 引擎提供快速且精準的全文檢索功能，讓您瞬間找到所需資訊。
- **深色/淺色主題 (Light/Dark Theme)**：支援主題切換，提供舒適的閱讀與寫作體驗。

## 🛠️ 技術棧 (Tech Stack)

本專案採用現代化的前端與桌面開發技術構建：

- **核心框架**：[Electron](https://www.electronjs.org/) (v39) + [electron-vite](https://electron-vite.org/)
- **前端框架**：[React](https://react.dev/) (v19) + [TypeScript](https://www.typescriptlang.org/)
- **狀態管理**：[Zustand](https://zustand-demo.pmnd.rs/)
- **資料庫**：[better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (本地 SQLite 資料庫)
- **樣式與 UI**：[Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)

## 🚀 快速開始 (Getting Started)

### 先決條件 (Prerequisites)

- **Node.js**: 建議使用 LTS 版本 (v18+)。
- **npm**: Node.js 的套件管理器。

### 安裝 (Installation)

1. **複製專案庫 (Clone the repository)**
   ```bash
   git clone https://github.com/your-username/thinkrium.git
   cd thinkrium
   ```

2. **安裝依賴 (Install dependencies)**
   ```bash
   npm install
   ```

### 開發 (Development)

啟動開發伺服器（包含 Electron 主進程與渲染進程的熱重載）：

```bash
npm run dev
```

### 建置 (Build)

為您的作業系統建置應用程式：

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📂 專案結構 (Project Structure)

本專案遵循 `electron-vite` 的推薦結構：

- **`electron/`**: 存放 Electron 主進程 (Main Process) 的相關代碼。
  - `main/`: 應用程式入口點。
  - `preload/`: 預加載腳本，用於安全地暴露 API 給渲染進程。
  - `ipc/`: 定義主進程與渲染進程之間的通訊處理。
  - `services/`: 核心業務邏輯與資料庫操作服務。

- **`src/renderer/`**: 存放 React 渲染進程 (Renderer Process) 的前端代碼。
  - `components/`: 可重用的 UI 組件。
  - `modules/`: 各個功能模組的頁面與邏輯。
  - `stores/`: Zustand 狀態管理存儲。

## 📸 截圖 (Screenshots)

*(待補充：此處將展示應用程式的主要介面截圖)*

### 主介面 (Dashboard)
![Dashboard Placeholder](docs/images/dashboard-placeholder.png)

### 筆記編輯器 (Note Editor)
![Editor Placeholder](docs/images/editor-placeholder.png)

## 🤝 貢獻 (Contributing)

我們歡迎任何形式的貢獻！如果您想參與開發，請遵循以下步驟：

1. Fork 本專案。
2. 建立您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 開啟一個 Pull Request。

## 📄 授權 (License)

本專案採用 [MIT License](LICENSE) 授權。
