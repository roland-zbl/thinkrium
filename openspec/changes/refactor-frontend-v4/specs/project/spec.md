## ADDED Requirements

### Requirement: Project List View

The Project List SHALL display projects grouped by status.

#### Scenario: Status groups
- **WHEN** user navigates to Project list
- **THEN** projects are grouped into 3 sections
- **AND** "🔶 進行中" section shows active projects
- **AND** "⏳ 待啟動" section shows pending projects
- **AND** "✅ 已完成" section shows completed projects (collapsed by default)

#### Scenario: Project card content
- **WHEN** project is displayed
- **THEN** card shows project title, material count, deliverable count, target date

#### Scenario: Status group collapsible
- **WHEN** user clicks group header
- **THEN** group toggles between expanded and collapsed

---

### Requirement: Project Status Visual

Projects SHALL display visual indicators based on status.

#### Scenario: Active project visual
- **WHEN** project status is "active"
- **THEN** icon color is warning (orange)
- **AND** background has warning tint

#### Scenario: Pending project visual
- **WHEN** project status is "pending"
- **THEN** text color is muted

#### Scenario: Completed project visual
- **WHEN** project status is "completed"
- **THEN** icon color is success (green)
- **AND** background has success tint

---

### Requirement: Project Page View

Double-clicking a project SHALL open a Project Page Tab.

#### Scenario: Project page layout
- **WHEN** user opens project page
- **THEN** page displays project info section
- **AND** deliverables section
- **AND** materials table
- **AND** project notes section

#### Scenario: Project info section
- **WHEN** viewing project info
- **THEN** shows creation date, target date
- **AND** status dropdown to change status

#### Scenario: Deliverables section
- **WHEN** viewing deliverables
- **THEN** shows list of deliverables with links
- **AND** shows "+ 新增產出" button

#### Scenario: Materials table
- **WHEN** viewing materials
- **THEN** shows date, title, summary columns
- **AND** shows "預覽" action per row

#### Scenario: Project notes section
- **WHEN** viewing project notes
- **THEN** shows editable text area for free-form notes

---

### Requirement: Project Status Dropdown

Projects SHALL allow status change via dropdown.

#### Scenario: Status options
- **WHEN** user clicks status dropdown
- **THEN** options show "進行中", "待啟動", "已完成"

#### Scenario: Status change
- **WHEN** user selects new status
- **THEN** project moves to corresponding group in list
- **AND** visual indicators update

---

### Requirement: Add Project Dialog

Users SHALL be able to create new projects.

#### Scenario: New project dialog fields
- **WHEN** user clicks "+ 新增專案"
- **THEN** dialog shows project name (required)
- **AND** target date (optional)
- **AND** status (default: 進行中)

#### Scenario: Project creation
- **WHEN** user submits dialog with valid name
- **THEN** new project is created
- **AND** appears in appropriate status group
