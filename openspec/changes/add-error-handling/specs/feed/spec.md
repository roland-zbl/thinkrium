## MODIFIED Requirements

### Requirement: Feed Error Handling

The system MUST provide clear, context-specific feedback for all Feed operations, including network failures, validation errors, and storage errors.

#### Scenario: Add feed failure
- **WHEN** adding a new feed fails (validation or network)
- **THEN** a specific error toast is displayed (e.g., "Failed to add feed: [Reason]")
- **AND** no duplicate "Operation failed" toast is shown

#### Scenario: Save item failure
- **WHEN** saving a feed item fails
- **THEN** a specific error toast is displayed (e.g., "Failed to save item: [Reason]")
