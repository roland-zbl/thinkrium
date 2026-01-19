## ADDED Requirements

### Requirement: OPML Import

The system SHALL allow users to import subscriptions from OPML files.

#### Scenario: Import valid OPML file

- **WHEN** user selects an OPML file for import
- **THEN** the system parses the file and extracts all RSS feed URLs
- **AND** adds each feed to the database
- **AND** preserves the folder/category structure from the OPML
- **AND** displays a summary showing number of feeds added

#### Scenario: Import with duplicates

- **WHEN** user imports an OPML containing feeds that already exist
- **THEN** the system skips duplicate feeds (matched by URL)
- **AND** reports the number of skipped feeds

#### Scenario: Import with errors

- **WHEN** some feeds in the OPML fail to validate
- **THEN** the system continues importing other valid feeds
- **AND** reports the failed feeds with error messages

---

### Requirement: OPML Export

The system SHALL allow users to export their subscriptions as an OPML file.

#### Scenario: Export all subscriptions

- **WHEN** user clicks the export button
- **THEN** the system generates a valid OPML file containing all subscriptions
- **AND** organizes feeds by their categories as folder outlines
- **AND** prompts user to choose a save location
- **AND** saves the file to the selected location

#### Scenario: Export includes metadata

- **WHEN** OPML is exported
- **THEN** each feed includes `title`, `xmlUrl`, and `htmlUrl` attributes
- **AND** the file includes a header with creation date
