## ADDED Requirements

### Requirement: Feed Management
The system SHALL allow users to manage RSS subscriptions.

#### Scenario: Add new subscription
- **WHEN** user enters a valid RSS URL in the "Add Subscription" dialog
- **THEN** the system fetches the feed metadata
- **AND** adds it to the database
- **AND** immediately fetches the latest items

#### Scenario: Remove subscription
- **WHEN** user chooses to remove a subscription
- **THEN** the subscription and its items are removed from the database

### Requirement: Feed Reading
The system SHALL display feed items from the local database.

#### Scenario: View items
- **WHEN** user selects a subscription or "All"
- **THEN** the system displays a list of items sorted by date (newest first)
- **AND** indicates read/unread status

#### Scenario: Background Updates
- **WHEN** the application is running
- **THEN** the system automatically checks for updates for all feeds every 15 minutes
