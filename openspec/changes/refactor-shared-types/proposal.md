# Change: Refactor Shared Types

## Why
Currently, `electron/ipc/feed.ipc.ts` imports types from `src/renderer/src/types`. This violates Clean Architecture principles as the Main process depends on the Renderer process.

## What Changes
- Move shared types to `src/shared/types/`.
- Configure `@shared` alias.
- Update imports in Main and Renderer processes.

## Impact
- Decouples Main and Renderer.
- Improves code organization.
