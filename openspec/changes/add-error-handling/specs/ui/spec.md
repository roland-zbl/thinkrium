## ADDED Requirements

### Requirement: Global Error Boundary

The application MUST catch unhandled React rendering errors and display a user-friendly fallback UI instead of crashing completely.

#### Scenario: Rendering error occurs
- **WHEN** a React component throws an error during rendering
- **THEN** the Error Boundary captures the error
- **AND** displays a friendly error message
- **AND** provides a "Reload Application" button

#### Scenario: Reload application
- **WHEN** the user clicks "Reload Application" on the error screen
- **THEN** the application reloads (refresh)
