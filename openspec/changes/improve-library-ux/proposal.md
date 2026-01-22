# Change: Improve Library UX

## Why

The Library module has several UX issues:
1. Date display uses raw ISO format instead of user-friendly relative dates
2. Missing add/delete note buttons
3. The "reset" button only resets filters but its purpose is unclear to users
4. Note preview font is too small for comfortable reading

## What Changes

- Optimize date display to show relative time (e.g., "3 天前")
- Add "新增筆記" and "刪除筆記" buttons to FilterBar
- Remove confusing reset button (it only resets filter state, not data)
- Increase preview content font size from `text-sm` to `text-base`

## Impact

- Affected specs: library
- Affected code:
  - `src/renderer/src/modules/library/components/FilterBar.tsx`
  - `src/renderer/src/modules/library/components/NoteTable.tsx`
  - `src/renderer/src/modules/library/components/NotePreview.tsx`
  - `src/renderer/src/modules/library/store/library.store.ts`
  - `src/renderer/src/modules/library/components/CreateNoteDialog.tsx` [NEW]
