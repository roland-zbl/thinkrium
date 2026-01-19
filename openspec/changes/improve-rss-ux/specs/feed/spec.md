## MODIFIED Requirements

### Requirement: Feed Reading

The system SHALL display feed items with proper visual distinction and filtering behavior.

#### Scenario: View items in unread filter

- **WHEN** user is viewing items with "unread" filter active
- **AND** user clicks an item to read it
- **THEN** the item is marked as read in the database
- **AND** the item remains visible in the list with a dimmed/grayed visual style
- **AND** the unread count for the subscription decreases by 1

#### Scenario: Clear recently read items

- **WHEN** user switches filter tab (to "all" or "saved")
- **OR** user switches to a different subscription
- **OR** user refreshes the feed
- **THEN** previously read items are removed from the unread list

#### Scenario: Auto-hide read toggle (optional)

- **WHEN** user enables "auto-hide read articles" setting
- **AND** user clicks an item in unread filter
- **THEN** the item immediately disappears from the list (legacy behavior)

---

## ADDED Requirements

### Requirement: Article Preview Typography

The system SHALL render article content with optimized typography for Chinese long-form reading.

#### Scenario: Chinese-optimized typography

- **WHEN** user previews an article in FeedPreview
- **THEN** the content is displayed with:
  - Font: Inter / Noto Sans TC / PingFang TC stack
  - Font size: 17-18px for body text
  - Line height: 1.8-2.0
  - Paragraph spacing: 1.5em
  - Max content width: 65 characters
  - Color contrast ratio ≥ 4.5:1 (WCAG AA)

#### Scenario: Code block rendering

- **WHEN** article contains code blocks
- **THEN** they are displayed with:
  - Distinct background color
  - Rounded corners
  - Horizontal scrolling for long lines

#### Scenario: Image display

- **WHEN** article contains images
- **THEN** images are:
  - Displayed responsively (max-width: 100%)
  - Centered within the content area
  - Have rounded corners and subtle shadow

---

### Requirement: Quick Note

The system SHALL allow users to save quick notes associated with feed items.

#### Scenario: Save quick note

- **WHEN** user types text in the Quick Note textarea
- **AND** clicks the Send button
- **THEN** the note is persisted to the database associated with the feed item
- **AND** a success toast notification is displayed

#### Scenario: Load existing quick note

- **WHEN** user opens preview for an item that has a saved quick note
- **THEN** the Quick Note textarea is pre-filled with the saved content

#### Scenario: Empty note handling

- **WHEN** user clicks Send with empty textarea
- **THEN** no action is taken
- **AND** the button remains disabled
