# Change: Add Library Sync with File System

## Why

When users delete Markdown files directly from the file system (outside the app), the Library database becomes out of sync. This creates orphan records that confuse users.

## What Changes

- Create a `note-sync.service.ts` that compares database records with actual files
- Remove database entries for files that no longer exist
- Trigger sync on app startup and when switching to Library view
- **BREAKING**: Removes the non-functional "reset" button from FilterBar

## Impact

- Affected specs: library
- Affected code:
  - `electron/services/note-sync.service.ts` [NEW]
  - `electron/ipc/note.ipc.ts`
  - `electron/preload.ts`
  - `src/renderer/src/modules/library/store/library.store.ts`
  - `src/renderer/src/modules/library/LibraryView.tsx`
