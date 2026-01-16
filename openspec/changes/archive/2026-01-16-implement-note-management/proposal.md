# Change: Implement Note Management

## Why

實作應用內筆記管理功能，讓用戶可以瀏覽、編輯和管理已保存的筆記，而不僅僅是從 RSS 保存。

## What Changes

- 擴展 Note IPC 支援列表查詢、更新、刪除
- 擴展 NoteService 添加更新和刪除方法
- 創建筆記列表和詳情組件
- 整合 Markdown 渲染

## Impact

- Affected specs: note
- Affected code: electron/ipc/note.ipc.ts, electron/services/note.service.ts, src/renderer/src/modules/note/
