## 1. System Setup
- [ ] 1.1 Verify/Add IPC for directory selection (`settings:select-dir`) in `electron/ipc/settings.ipc.ts` and `preload`.
- [ ] 1.2 Create `src/renderer/src/components/SetupDialog.tsx` for `rootDir` selection.
- [ ] 1.3 Integrate `SetupDialog` into `App.tsx` with startup check logic.

## 2. RSS Integration
- [ ] 2.1 Refactor `src/renderer/src/modules/feed/store/feed.store.ts` to use `window.api.feed`.
- [ ] 2.2 Update `src/renderer/src/modules/feed/components/AddSubscriptionDialog.tsx` to use the store action.
- [ ] 2.3 Implement feed deletion in `SubscriptionSidebar` (UI + Store).

## 3. Background Services
- [ ] 3.1 Create `electron/services/scheduler.service.ts` for periodic feed fetching.
- [ ] 3.2 Initialize scheduler in `electron/main.ts`.
