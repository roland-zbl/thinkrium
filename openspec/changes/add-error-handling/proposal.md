# Change: Add Error Handling and Error Boundary

## Why

The current application lacks a global error boundary, meaning React rendering errors can crash the entire application white-screen. Additionally, error feedback for user actions is sometimes generic ("Operation failed") or duplicated. Users need a more resilient application and clear, context-specific feedback.

## What Changes

- Add a global `ErrorBoundary` component to catch React errors and provide a "Reload" option.
- Enhance `invokeIPC` utility to allow suppressing default error toasts.
- Update `FeedService` (Store) to provide specific, user-friendly error messages for all operations.

## Impact

- Affected specs: `ui`, `feed`
- Affected code: `src/renderer/src/App.tsx`, `src/renderer/src/components/ErrorBoundary.tsx`, `src/renderer/src/utils/ipc.ts`, `src/renderer/src/modules/feed/store/feed.store.ts`
