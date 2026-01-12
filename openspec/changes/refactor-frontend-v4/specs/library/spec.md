## ADDED Requirements

### Requirement: Library Layout

The Library SHALL display a two-column layout with note list and preview panel.

#### Scenario: Layout structure
- **WHEN** user navigates to Library
- **THEN** left side displays note list (flex width)
- **AND** right side is Preview Panel (400px, initially collapsed)

---

### Requirement: Filter Bar

The Library SHALL provide a filter bar with 4 filter dropdowns.

#### Scenario: Filter options
- **WHEN** user views Library
- **THEN** filter bar displays Type, Tags, Date, and 關聯專案 dropdowns
- **AND** all defaults to "全部"

#### Scenario: Type filter
- **WHEN** user selects "note" in Type dropdown
- **THEN** list only shows notes (not diary)
- **AND** filter state is preserved when switching views

#### Scenario: Date filter
- **WHEN** user selects date range
- **THEN** list only shows items within that range

#### Scenario: Project filter
- **WHEN** user selects a project in 關聯專案 dropdown
- **THEN** list only shows materials associated with that project

---

### Requirement: View Toggle

The Library SHALL support multiple view modes.

#### Scenario: List view (default)
- **WHEN** user is in list view
- **THEN** notes display in table format
- **AND** columns show Date, Title, Type, Project

#### Scenario: Calendar view (Phase 2)
- **WHEN** user toggles to calendar view
- **THEN** notes display on calendar by date

#### Scenario: Tag cloud view (Phase 2)
- **WHEN** user toggles to tag cloud view
- **THEN** tags display as cloud with size by frequency

---

### Requirement: Note List Virtual Scrolling

The Library note list SHALL support virtual scrolling for performance.

#### Scenario: Large dataset
- **WHEN** library contains 1000+ notes
- **THEN** scrolling maintains 60fps
- **AND** only visible items are rendered

---

### Requirement: Note Preview

The Library SHALL provide a preview panel for selected notes.

#### Scenario: Single click preview
- **WHEN** user single-clicks a note in list
- **THEN** Preview Panel slides in from right
- **AND** displays note content

#### Scenario: Preview actions
- **WHEN** Preview Panel is open
- **THEN** "編輯" button opens Editor Tab
- **AND** "加入專案" button opens project selector Popover

#### Scenario: Double click edit
- **WHEN** user double-clicks a note in list
- **THEN** Editor Tab opens directly
- **AND** Preview Panel is not shown
