## ADDED Requirements

### Requirement: Root Directory Setup
The system MUST ensure a valid root directory is set for data storage.

#### Scenario: First Launch
- **WHEN** the application starts
- **AND** no `rootDir` is configured in settings
- **THEN** the system displays a modal dialog asking the user to select a folder
- **AND** blocks access to the main interface until a valid folder is selected

#### Scenario: Directory Selection
- **WHEN** user clicks "Select Folder"
- **THEN** the system opens the native directory selection dialog
- **AND** saves the selected path to settings upon confirmation
