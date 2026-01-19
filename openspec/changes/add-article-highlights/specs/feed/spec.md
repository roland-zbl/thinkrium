## ADDED Requirements

### Requirement: Text Highlighting

The system SHALL allow users to highlight text within articles.

#### Scenario: Create highlight

- **WHEN** user selects text in the article preview
- **THEN** a highlight toolbar appears above the selection
- **AND** user can choose a highlight color (yellow, green, blue, pink)
- **AND** the selected text is marked with the chosen color
- **AND** the highlight is saved to the database

#### Scenario: View existing highlights

- **WHEN** user opens an article that has previously created highlights
- **THEN** all highlights are visually rendered with their respective colors
- **AND** highlights are preserved across sessions

#### Scenario: Delete highlight

- **WHEN** user clicks on an existing highlight
- **AND** selects "Remove highlight" option
- **THEN** the highlight is removed from the text and database

#### Scenario: Highlight with keyboard shortcut

- **WHEN** user selects text and presses `H`
- **THEN** the text is highlighted with the default color (yellow)

---

### Requirement: Highlight Annotations

The system SHALL allow users to add notes to highlights.

#### Scenario: Add note to highlight

- **WHEN** user creates a highlight
- **AND** clicks the "Add Note" button on the toolbar
- **THEN** a text input appears for entering a note
- **AND** the note is saved with the highlight

#### Scenario: View highlight note

- **WHEN** user hovers over a highlight that has a note
- **THEN** the note is displayed in a tooltip
- **OR** in a side panel

#### Scenario: Edit highlight note

- **WHEN** user clicks on a highlight with an existing note
- **THEN** the note input is shown with current content
- **AND** user can modify and save the note

#### Scenario: Annotation with keyboard shortcut

- **WHEN** user selects text and presses `N`
- **THEN** the text is highlighted
- **AND** the note input is immediately focused
