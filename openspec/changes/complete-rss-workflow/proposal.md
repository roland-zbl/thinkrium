# Change: Complete RSS Workflow and System Setup

## Why

To replace the user's current RSS tool (Folo) with Thinkrium, we need a fully functional RSS reader.
Currently, the RSS frontend uses mock data and is not connected to the backend database.
Additionally, the application requires a "Knowledge Base Root Directory" to function (for future note storage), but there is no UI to set this up on first launch.

## What Changes

- **System Setup**: Add a startup check for `rootDir`. If missing, show a mandatory setup dialog.
- **RSS Backend Integration**: Connect the frontend Feed Store to the Electron IPC (SQLite + RSS Service), replacing mock data.
- **Subscription Management**: Enable adding and removing RSS feeds via the UI.
- **Background Fetching**: Implement a background scheduler to automatically update feeds every 15 minutes.

## Impact

- **Affected Specs**: `feed`, `system` (new)
- **Affected Code**:
    - `src/renderer/src/modules/feed/store/feed.store.ts` (Refactor)
    - `src/renderer/src/components/SetupDialog.tsx` (New)
    - `electron/services/scheduler.service.ts` (New)
    - `electron/main.ts` (Update)
