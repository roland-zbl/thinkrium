# dashboard Specification

## Purpose
TBD - created by archiving change refactor-frontend-v4. Update Purpose after archive.
## Requirements
### Requirement: Dashboard Layout

The Dashboard SHALL display a 2x2 grid layout with 4 widgets.

#### Scenario: Grid structure

- **WHEN** user navigates to Dashboard
- **THEN** page displays 2 columns × 2 rows grid
- **AND** Today Focus widget is at top-left
- **AND** Active Projects widget is at top-right
- **AND** New Items widget is at bottom-left
- **AND** Recent Completed widget is at bottom-right

---

### Requirement: Today Focus Widget

The Today Focus widget SHALL display today's diary and most urgent project.

#### Scenario: Diary exists

- **WHEN** today's diary exists
- **THEN** widget displays diary title
- **AND** clicking opens Editor Tab

#### Scenario: Diary not exists

- **WHEN** today's diary does not exist
- **THEN** widget displays "+ 開始寫日記" button
- **AND** clicking creates new diary and opens Editor Tab

#### Scenario: Most urgent project display

- **WHEN** there are active projects with target dates
- **THEN** widget displays project with nearest target date
- **AND** shows "X 天後到期" countdown

#### Scenario: No active projects

- **WHEN** there are no active projects
- **THEN** widget displays "目前沒有進行中的專案"
- **AND** shows "+ 新增專案" button

---

### Requirement: Active Projects Widget

The Active Projects widget SHALL display list of in-progress projects.

#### Scenario: Projects display

- **WHEN** there are active projects
- **THEN** widget displays project name, target date, material count, deliverable count

#### Scenario: Empty state

- **WHEN** there are no active projects
- **THEN** widget displays "目前沒有進行中的專案"

---

### Requirement: New Items Widget

The New Items widget SHALL display unread Feed items count and preview.

#### Scenario: Unread items exist

- **WHEN** there are unread Feed items
- **THEN** widget displays count badge
- **AND** shows 2-3 item previews
- **AND** shows "查看全部" link

#### Scenario: Empty state

- **WHEN** all items are read
- **THEN** widget displays "已全部閱讀"

---

### Requirement: Recent Completed Widget

The Recent Completed widget SHALL display recently completed projects.

#### Scenario: Completed projects exist

- **WHEN** there are completed projects
- **THEN** widget displays project name and completion date

#### Scenario: Empty state

- **WHEN** there are no completed projects
- **THEN** widget displays "尚無已完成的專案"

