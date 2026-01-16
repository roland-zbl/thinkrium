## MODIFIED Requirements

### Requirement: Project Data Management

The system SHALL manage project data via the `ProjectStore`, interacting with the backend through `window.api.project`.

#### Scenario: Fetching project list
- **WHEN** the `fetchProjects` action is invoked
- **THEN** the store SHALL call `window.api.project.list()`
- **AND** update the `projects` state with the returned data
- **AND** correct `materialCount` and `deliverableCount` SHALL be populated from the backend response.

#### Scenario: Fetching project items
- **WHEN** the `fetchProjectItems` action is invoked with a valid `projectId`
- **THEN** the store SHALL call `window.api.project.getItems(projectId)`
- **AND** update the `activeProjectItems` state with the returned list.

#### Scenario: Updating project status
- **WHEN** `updateProjectStatus` is called
- **THEN** the store SHALL call `window.api.project.updateStatus` via IPC
- **AND** optimistically update the local state.
