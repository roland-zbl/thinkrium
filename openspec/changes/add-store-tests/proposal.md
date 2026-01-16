# Change: Add Store Tests and Refactor Library Filtering

## Why

Currently, the `library.store` and `project.store` lack unit tests, leading to potential regressions and lower code confidence. The filtering logic for the library is likely scattered in UI components, violating the "Single Source of Truth" principle and making it harder to test.

## What Changes

- **Refactor Library Store**: Move note filtering logic into `library.store.ts` as a `getFilteredNotes()` selector.
- **Add Unit Tests**:
  - `library.store.test.ts`: Cover fetching, selection, and the new filtering logic.
  - `project.store.test.ts`: Cover fetching projects, items, and status updates.
- **Update Test Setup**: Enhance `setup.ts` to mock missing `window.api.project` IPC calls.

## Impact

- **Affected Code**:
  - `src/renderer/src/modules/library/store/library.store.ts`
  - `src/renderer/src/__tests__/setup.ts`
- **New Files**:
  - `src/renderer/src/modules/library/store/__tests__/library.store.test.ts`
  - `src/renderer/src/modules/project/store/__tests__/project.store.test.ts`
