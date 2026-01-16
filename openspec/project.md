# Project Context

## Purpose

Knowledge Base App - 一個用於管理和瀏覽個人知識庫內容的桌面應用程式。目標是提供高效的資訊組織、檢索和閱讀體驗。

## Tech Stack

### Core

- **Runtime**: Electron 39.x (桌面應用程式框架)
- **Frontend**: React 19.x with TypeScript 5.9.x
- **Bundler**: Vite 7.x via electron-vite 5.x
- **Package Manager**: npm

### Language Standards

- **TypeScript**: 嚴格模式 (strict mode)
- **ECMAScript**: ES2023+ features
- **React**: React 19 patterns (use `React.FC` for function components)

### Development Tools

- **Linting**: ESLint 9.x with React/React Hooks plugins
- **Formatting**: Prettier 3.x
- **Type Checking**: tsc --noEmit

## Project Conventions

### Code Style

- Use **functional components** with TypeScript (`React.FC`)
- Use **named exports** for components (e.g., `export const FeedPage: React.FC`)
- Use **PascalCase** for component names and files (e.g., `FeedPage.tsx`)
- Use **camelCase** for variables, functions, and hooks
- Use **kebab-case** for CSS class names
- Prefer **arrow functions** for component definitions
- Use **Fragment shorthand** (`<>...</>`) when no key is needed

### File Organization

```
src/
├── renderer/src/
│   ├── components/     # Shared/global components
│   ├── modules/        # Feature modules
│   │   └── [feature]/
│   │       └── components/  # Feature-specific components
│   ├── assets/         # Static assets (images, icons)
│   └── App.tsx         # Root component
├── main/               # Electron main process
└── preload/            # Preload scripts
```

### Architecture Patterns

- **Module-based architecture**: 每個功能模組 (feature module) 有自己的 `components/` 目錄
- **Component hierarchy**: Page → Container → UI Components
- **Separation of concerns**:
  - Components handle UI rendering
  - Zustand stores handle state management
  - IPC services handle Main/Renderer communication

### Naming Conventions

| Type           | Convention     | Example                  |
| -------------- | -------------- | ------------------------ |
| Component      | PascalCase     | `FeedCard.tsx`           |
| Page Component | `*Page.tsx`    | `FeedPage.tsx`           |
| Hook           | `use*`         | `useFeedData.ts`         |
| CSS File       | Component name | `FeedCard.css` or inline |
| Test File      | `*.test.tsx`   | `FeedCard.test.tsx`      |

### Testing Strategy

- Unit tests with Vitest for stores and utilities
- Component tests with @testing-library/react
- E2E tests (planned) for Electron IPC workflows

### Git Workflow

- Feature branches from `main`
- Commit message format: `type: description` (e.g., `feat: add feed filtering`)

## Domain Context

### Knowledge Base Concepts

- **Feed**: 資訊流介面，展示知識條目列表
- **Card**: 單個知識條目的卡片式呈現
- **Filters**: 篩選器，用於過濾特定類型的內容
- **Tags**: 標籤系統，用於分類和搜尋

### User Flows

1. 使用者在 Feed 頁面瀏覽所有知識條目
2. 使用者透過篩選器縮小顯示範圍
3. 使用者點擊卡片查看詳細內容
4. (Future) 使用者可以新增、編輯、刪除條目

## Important Constraints

### Technical Constraints

- 必須支援離線使用
- 資料存儲在本地 (考慮 SQLite 或 JSON files)
- UI 語言: 繁體中文優先

### Performance Requirements

- Feed 頁面應能順暢渲染 1000+ 條目
- 首次載入時間 < 3 秒

## External Dependencies

### Electron APIs

- `ipcRenderer` / `ipcMain` for process communication
- `dialog` for file operations
- `fs` (via preload) for local file access
- `better-sqlite3` for local database

### Local-First Architecture

- All data stored locally as SQLite database and Markdown files
- No cloud dependency required
- Future: Optional Obsidian Vault import/export

## Coding Skills Reference

When implementing specific types of tasks, refer to the corresponding Skill:

| Task Type      | Skill Path                              | Description                               |
| -------------- | --------------------------------------- | ----------------------------------------- |
| UI Development | `.agent/skills/ui-development/SKILL.md` | Accessibility, animations, z-index layers |

### Skills Integration Guidelines

1. **Before implementing UI changes**, read the ui-development skill constraints
2. **Follow the constraints** defined in the skill file
3. **Validate against both**:
   - `spec.md` for functional requirements (What to build)
   - `SKILL.md` for implementation quality (How to build)
