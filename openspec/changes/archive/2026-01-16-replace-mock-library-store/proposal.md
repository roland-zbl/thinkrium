# Change: Replace Mock Library Store

## Why

Currently, the Library module uses mock data (`mockNotes`) for development. To make the application functional, it needs to be connected to the real backend IPC API (`window.api.note`). This will allow users to view their actual notes in the library.

## What Changes

- Update `LibraryStore` to fetch notes using `window.api.note.list()` instead of using mock data.
- Implement `fetchNote` in `LibraryStore` to fetch full note content using `window.api.note.get()`.
- Update `NotePreview` component to display the real content of the selected note using `react-markdown`.

## Impact

- Affected specs: `library`
- Affected code:
    - `src/renderer/src/modules/library/store/library.store.ts`
    - `src/renderer/src/modules/library/components/NotePreview.tsx`
