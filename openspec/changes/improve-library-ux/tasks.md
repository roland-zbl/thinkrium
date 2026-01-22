## 1. Date Display Optimization

- [ ] 1.1 Install/verify `date-fns` is available
- [ ] 1.2 In `NoteTable.tsx`, create helper function for relative date display:
  - Less than 7 days: show "X 天前" using `formatDistanceToNow`
  - 7+ days: show "MM/DD" format
  - Invalid/missing date: show "-"
- [ ] 1.3 Update date column width if needed for the new format

## 2. Add/Delete Note Buttons

- [ ] 2.1 In `FilterBar.tsx`, remove the confusing reset button (lines 69-75)
- [ ] 2.2 Add "新增筆記" button with `Plus` icon
- [ ] 2.3 Add "刪除筆記" button with `Trash2` icon (disabled when no note selected)
- [ ] 2.4 Create `CreateNoteDialog.tsx` component:
  - Title input field
  - Submit creates empty markdown note
  - Use Radix Dialog
- [ ] 2.5 Add `deleteNote(id)` action to `library.store.ts`:
  - Call `window.api.note.delete(id)`
  - Remove from local state
  - Show confirmation dialog before deletion
- [ ] 2.6 Add `createNote(title)` action to `library.store.ts`

## 3. Preview Readability

- [ ] 3.1 In `NotePreview.tsx`, change content container from `text-sm` to `text-base`
- [ ] 3.2 Add `prose-lg` class to ReactMarkdown wrapper for better line height
- [ ] 3.3 Verify Chinese text displays comfortably

## 4. Testing

- [ ] 4.1 Verify relative dates display correctly
- [ ] 4.2 Test creating a new note via dialog
- [ ] 4.3 Test deleting a note with confirmation
- [ ] 4.4 Verify preview readability improvement
