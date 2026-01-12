## MODIFIED Requirements

### Requirement: Feed Layout

The Feed SHALL display a three-column layout with resizable panels.

#### Scenario: Three column structure
- **WHEN** user navigates to Feed
- **THEN** left column shows Subscription Sidebar (200px, collapsible)
- **AND** middle column shows Feed Item List (flex width)
- **AND** right column shows Preview Panel (400px, initially collapsed)

#### Scenario: Column resizing
- **WHEN** user drags panel handles
- **THEN** columns resize accordingly
- **AND** respects minimum widths

---

### Requirement: Feed Subscription Sidebar

The Feed SHALL provide a subscription management sidebar.

#### Scenario: Subscription groups
- **WHEN** user views subscription sidebar
- **THEN** subscriptions are grouped by category
- **AND** clicking a subscription filters the item list

#### Scenario: All items view
- **WHEN** user clicks "全部" at top
- **THEN** item list shows all items from all subscriptions

#### Scenario: Add subscription
- **WHEN** user clicks "+ 新增訂閱"
- **THEN** Add Subscription Dialog opens

---

### Requirement: Add Subscription Dialog

The Add Subscription Dialog SHALL collect subscription information.

#### Scenario: Dialog fields
- **WHEN** dialog is opened
- **THEN** displays RSS URL field (required)
- **AND** displays Name field (optional, auto-filled from feed)
- **AND** displays Category dropdown (optional, default "未分類")

#### Scenario: URL validation
- **WHEN** user enters URL and submits
- **THEN** system validates URL format
- **AND** fetches feed to auto-fill name if empty

---

### Requirement: Feed Item List

The Feed item list SHALL support virtual scrolling and status display.

#### Scenario: Virtual scrolling
- **WHEN** list contains 1000+ items
- **THEN** scrolling maintains 60fps
- **AND** only visible items are rendered

#### Scenario: Filter tabs
- **WHEN** user views item list
- **THEN** filter tabs show "全部", "未讀", "已保存"

---

### Requirement: Feed Item Status Visual

Feed items SHALL display visual indicators based on status.

#### Scenario: Unread item visual
- **WHEN** item is unread
- **THEN** left border shows 4px primary color
- **AND** title is font-semibold

#### Scenario: Read item visual
- **WHEN** item is read
- **THEN** no left border
- **AND** title is font-normal with opacity-70

#### Scenario: Selected item visual
- **WHEN** item is selected
- **THEN** background is bg-muted
- **AND** right border shows 2px primary color

---

### Requirement: Project Selector Popover

The Project Selector Popover SHALL allow quick project selection.

#### Scenario: Popover content
- **WHEN** popover is triggered (by drag or button click)
- **THEN** shows search input at top
- **AND** shows list of active and pending projects
- **AND** shows "+ 新增專案" button at bottom

#### Scenario: Search filtering
- **WHEN** user types in search input
- **THEN** project list filters in real-time

#### Scenario: Project selection
- **WHEN** user clicks a project
- **THEN** action is performed (save + add to project)
- **AND** popover closes

#### Scenario: Create new project
- **WHEN** user clicks "+ 新增專案"
- **THEN** Add Project Dialog opens
- **AND** after creation, item is added to new project

---

### Requirement: Feed Preview Panel

The Feed preview SHALL include quick note feature.

#### Scenario: Quick note input
- **WHEN** preview is open
- **THEN** shows "速記" text area at bottom
- **AND** user can type notes

#### Scenario: Save with quick note
- **WHEN** user clicks "保存為筆記" with text in quick note
- **THEN** note is saved with quick note content appended
