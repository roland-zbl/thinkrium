## ADDED Requirements

### Requirement: Feed Folders

The system SHALL allow users to organize subscriptions into hierarchical folders.

#### Scenario: Create folder

- **WHEN** user clicks "New Folder" button
- **THEN** a new folder is created in the root level
- **AND** user can immediately rename it

#### Scenario: Move subscription to folder

- **WHEN** user right-clicks a subscription and selects "Move to Folder"
- **OR** user drags a subscription onto a folder
- **THEN** the subscription is moved into that folder
- **AND** it appears nested under the folder in the sidebar

#### Scenario: View folder contents

- **WHEN** user clicks on a folder
- **THEN** the article list shows all items from all subscriptions within that folder (and subfolders)
- **AND** the folder's unread count reflects the total of all contained subscriptions

#### Scenario: Collapse/expand folder

- **WHEN** user clicks the collapse icon on a folder
- **THEN** the folder's children are hidden
- **AND** the collapse state is persisted across sessions

#### Scenario: Delete folder

- **WHEN** user deletes a folder
- **THEN** the folder is removed
- **AND** all subscriptions within are moved to the root level (not deleted)

#### Scenario: Nested folders

- **WHEN** user drags a folder into another folder
- **THEN** the folder becomes a child of the target folder
- **AND** can be nested up to 3 levels deep
