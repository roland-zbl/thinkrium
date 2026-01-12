# Change: Frontend Architecture Refactoring

> 依據產品架構框架 v4，全面重構前端 UI 架構

## Why

現有前端程式碼與最新產品架構 v4 有顯著差異。Feed 和 Note 模塊已部分實作，但缺少 Dashboard、Library、Project 模塊，且 UI 架構、導航系統、預覽機制均需重新設計。為確保產品方向正確，需進行前端架構重構。

## What Changes

- **BREAKING**: 移除現有 `modules/`、`components/feed/`、`components/note/` 目錄
- **NEW**: 建立新的模塊架構（Dashboard、Feed、Library、Project、Editor）
- **NEW**: 實作 Design Tokens 系統
- **NEW**: 實作 display:none 視圖狀態保持策略
- **NEW**: 加入虛擬滾動、拖曳機制、鍵盤快捷鍵
- **MODIFIED**: Sidebar 導航結構改為 4 個主入口
- **MODIFIED**: Tab 系統精簡為只放 Editor/ProjectPage

## Impact

- Affected specs: 
  - `ui/spec.md` - 佈局、導航、Tab、拖曳、快捷鍵、預覽、刷新
  - `core/spec.md` - Design Tokens、分層、模塊邊界、狀態管理
  - `dashboard/spec.md` - ★ NEW - Dashboard 完整規格
  - `feed/spec.md` - ★ MODIFIED - 三欄佈局、訂閱、彈窗、視覺狀態
  - `library/spec.md` - ★ NEW - 過濾器、視圖、虛擬滾動
  - `project/spec.md` - ★ NEW - 狀態分組、專案頁、彈窗
- Affected code: `src/renderer/src/` 大部分檔案
- New dependencies: `@tanstack/react-virtual`, `react-hotkeys-hook`

## Scope Definition

### In Scope (Phase 1 - 原型)
- 四大模塊 UI 骨架與基本交互
- Mock 資料開發
- 導航系統、預覽機制、Tab 系統

### Out of Scope (Phase 2+)
- Editor 完整功能
- 日曆視圖、標籤雲視圖
- 空狀態美化、Loading Skeleton
- Toast 通知系統
