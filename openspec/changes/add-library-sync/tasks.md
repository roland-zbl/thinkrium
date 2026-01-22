## 1. Backend Sync Service

- [ ] 1.1 Create `electron/services/note-sync.service.ts`:
  ```typescript
  export class NoteSyncService {
    async syncWithFileSystem(): Promise<{ removed: number }> {
      // 1. Get all notes from database
      // 2. For each note with file_path, check if file exists
      // 3. Delete database record if file doesn't exist
      // 4. Return count of removed records
    }
  }
  ```
- [ ] 1.2 Implement file existence check using `fs.existsSync`
- [ ] 1.3 Use transaction for batch deletions

## 2. IPC Integration

- [ ] 2.1 Add `note:sync` IPC handler in `note.ipc.ts`
- [ ] 2.2 Expose `window.api.note.sync()` in `preload.ts`

## 3. Frontend Integration

- [ ] 3.1 Add `syncNotes()` action to `library.store.ts`:
  - Call `window.api.note.sync()`
  - Refetch notes after sync
- [ ] 3.2 In `LibraryView.tsx`, call `syncNotes()` when view becomes active
- [ ] 3.3 Show toast notification if notes were cleaned up

## 4. Testing

- [ ] 4.1 Create `note-sync.service.test.ts` with mock file system
- [ ] 4.2 Manual test: Create note, delete MD file, switch to Library
- [ ] 4.3 Verify orphan record is removed and notification shown
