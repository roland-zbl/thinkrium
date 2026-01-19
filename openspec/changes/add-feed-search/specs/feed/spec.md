## ADDED Requirements

### Requirement: Full-Text Search

The system SHALL provide full-text search across all feed items.

#### Scenario: Search by keyword

- **WHEN** user types a search query in the search bar
- **THEN** the system searches title, content, and author fields
- **AND** displays matching articles ranked by relevance
- **AND** highlights the matching keywords in results

#### Scenario: Search within scope

- **WHEN** user selects a specific subscription or folder
- **AND** performs a search
- **THEN** results are limited to items within that scope

#### Scenario: Instant search with debounce

- **WHEN** user types in the search bar
- **THEN** search executes after 300ms of no typing (debounce)
- **AND** a loading indicator is shown during search

#### Scenario: Clear search

- **WHEN** user clicks the clear button or presses Escape
- **THEN** the search query is cleared
- **AND** the normal filtered item list is restored

#### Scenario: Search keyboard shortcut

- **WHEN** user presses `/` or `Cmd+K` (Mac) / `Ctrl+K` (Windows)
- **THEN** the search input is focused

#### Scenario: Empty search results

- **WHEN** search returns no matching items
- **THEN** a friendly "No results found" message is displayed
- **AND** suggestions to broaden the search are shown
