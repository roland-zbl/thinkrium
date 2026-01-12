## MODIFIED Requirements

### Requirement: Application Layout

The application SHALL provide a three-column layout with Sidebar, Main Content, and Auxiliary Panel.

#### Scenario: Normal layout state
- **WHEN** application is launched
- **THEN** Sidebar displays as 56px icon column
- **AND** Main Content fills remaining width
- **AND** Auxiliary Panel is 280px wide (collapsible)

#### Scenario: Sidebar expanded state
- **WHEN** user hovers over or clicks the Sidebar toggle
- **THEN** Sidebar expands to 200px
- **AND** displays navigation labels and project list

#### Scenario: Focus mode
- **WHEN** user triggers focus mode via keyboard shortcut
- **THEN** Sidebar and Auxiliary Panel are hidden
- **AND** Main Content takes 100% width

---

### Requirement: Navigation System

The application SHALL provide a Sidebar-based navigation system with 4 main entry points.

#### Scenario: Navigation items display
- **WHEN** user views the Sidebar
- **THEN** Dashboard, Feed, Library, Project icons are visible
- **AND** AI and Settings icons are visible below separator

#### Scenario: Navigation switching
- **WHEN** user clicks a navigation item
- **THEN** Main Content switches to corresponding view
- **AND** previous view state is preserved (scroll position, selection)

#### Scenario: View state persistence
- **WHEN** user scrolls in Feed view, switches to Library, then returns to Feed
- **THEN** Feed view scroll position is restored
- **AND** selected item is still selected

---

### Requirement: Tab System

The application SHALL provide a Tab Bar for Editor and ProjectPage tabs only.

#### Scenario: Tab creation
- **WHEN** user double-clicks a note in Library or clicks "Edit" in preview
- **THEN** an Editor Tab is created in Tab Bar
- **AND** Tab displays the note title

#### Scenario: Navigation views do not create tabs
- **WHEN** user clicks Dashboard, Feed, Library, or Project in Sidebar
- **THEN** no new Tab is created
- **AND** view is rendered directly in Main Content

#### Scenario: Tab close with unsaved changes
- **WHEN** user clicks close on a Tab with unsaved changes
- **THEN** confirmation dialog appears
- **AND** offers "Don't Save", "Save", "Cancel" options

#### Scenario: Last tab closed
- **WHEN** user closes the last Tab
- **THEN** Tab Bar is hidden
- **AND** current navigation view is displayed

---

## ADDED Requirements

### Requirement: Drag and Drop to Project

The application SHALL support dragging items to add them to projects.

#### Scenario: Drag Feed item to Project icon (collapsed)
- **WHEN** user drags a Feed item to the Project icon in collapsed Sidebar
- **THEN** a Popover appears showing project list
- **AND** user can select a project to save and add the item

#### Scenario: Drag Feed item to specific project (expanded)
- **WHEN** Sidebar is expanded and user drags a Feed item to a project name
- **THEN** item is saved as note and added to that project directly

#### Scenario: Drag note to project
- **WHEN** user drags a note from Library to a project in expanded Sidebar
- **THEN** note is added to that project's materials

---

### Requirement: Keyboard Shortcuts

The application SHALL support keyboard shortcuts for common operations.

#### Scenario: Global navigation shortcuts
- **WHEN** user presses Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+4
- **THEN** view switches to Dashboard, Feed, Library, Project respectively

#### Scenario: Feed shortcuts
- **WHEN** user presses S in Feed with item selected and input not focused
- **THEN** selected item is saved as note

#### Scenario: List navigation shortcuts
- **WHEN** user presses J or K in a list view
- **THEN** selection moves down or up respectively

#### Scenario: Shortcuts disabled in input
- **WHEN** user is typing in an input field or textarea
- **THEN** S, P, E shortcuts are disabled
- **AND** normal typing continues

---

### Requirement: Preview Panel

The application SHALL provide a split-view preview mechanism.

#### Scenario: Preview on single click
- **WHEN** user single-clicks an item in Feed, Library, or Project materials
- **THEN** right-side Preview Panel slides in from right
- **AND** displays item content

#### Scenario: Preview panel initially collapsed
- **WHEN** user enters Feed, Library, or Project view
- **THEN** Preview Panel is collapsed
- **AND** list takes full available width

#### Scenario: Close preview with Escape
- **WHEN** user presses Escape with Preview Panel open
- **THEN** Preview Panel collapses
- **AND** list regains full width

---

### Requirement: Data Refresh Mechanism

The application SHALL provide automatic and manual data refresh for Feed.

#### Scenario: Auto refresh on app launch
- **WHEN** application starts
- **THEN** all subscriptions are fetched automatically

#### Scenario: Auto refresh on view switch
- **WHEN** user switches to Feed view and last fetch was > 5 minutes ago
- **THEN** subscriptions are refreshed automatically

#### Scenario: Manual refresh button
- **WHEN** user clicks refresh button in Feed toolbar
- **THEN** current subscription is refreshed
- **AND** button shows spinning animation during refresh
