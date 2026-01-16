## ADDED Requirements

### Requirement: Real Note Data Integration

The Library module MUST fetch and display real note data from the backend.

#### Scenario: View Note List
- **WHEN** the user opens the Library page
- **THEN** the application SHALL fetch the list of notes from the backend using `window.api.note.list()`
- **AND** display them in the `NoteTable`.

#### Scenario: View Note Details
- **WHEN** the user selects a note in the list
- **THEN** the application SHALL fetch the full content of the note using `window.api.note.get(id)`
- **AND** display the rendered Markdown content in the `NotePreview` panel.
