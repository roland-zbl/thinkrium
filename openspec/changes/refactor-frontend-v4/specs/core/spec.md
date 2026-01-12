## ADDED Requirements

### Requirement: Design Tokens System

The application SHALL use a centralized Design Tokens system for all visual values.

#### Scenario: Color tokens usage
- **WHEN** developer needs to use a color value
- **THEN** they SHALL reference tokens.colors.* (e.g., primary, bgBase, textPrimary)
- **AND** hardcoded color values are forbidden

#### Scenario: Spacing tokens usage
- **WHEN** developer needs spacing values
- **THEN** they SHALL use tokens.spacing.* (xs, sm, md, lg, xl)
- **AND** hardcoded pixel values are forbidden

#### Scenario: Theme change
- **WHEN** tokens.ts is modified
- **THEN** all components using tokens reflect the change
- **AND** no individual component needs modification

---

### Requirement: Component Layering

The application SHALL follow a strict component layering architecture.

#### Scenario: Layer hierarchy
- **WHEN** components are organized
- **THEN** Pages layer can import from Features layer
- **AND** Features layer can import from UI layer
- **AND** UI layer can import from Tokens only

#### Scenario: Forbidden imports
- **WHEN** UI layer component imports from Features or Pages
- **THEN** this is a violation of architecture rules
- **AND** code review SHALL reject such changes

---

### Requirement: Module Boundaries

The application SHALL enforce strict module boundaries.

#### Scenario: Private by default
- **WHEN** a component is created
- **THEN** it SHALL be placed in the module's private components/ directory
- **AND** only promoted to global when used by multiple modules

#### Scenario: Single entry point
- **WHEN** external code imports from a module
- **THEN** it SHALL only import from module's index.ts
- **AND** direct imports to internal files are forbidden

#### Scenario: No cross-module imports
- **WHEN** module A needs data from module B
- **THEN** it SHALL communicate through global Store or EventBus
- **AND** direct imports between modules are forbidden

---

### Requirement: State Management Layers

The application SHALL use a 4-layer state management approach.

#### Scenario: Global state scope
- **WHEN** state is needed across modules
- **THEN** it SHALL be placed in stores/app.store.ts
- **AND** includes view state, tabs, theme

#### Scenario: Module state scope
- **WHEN** state is module-specific
- **THEN** it SHALL be placed in modules/xxx/store/
- **AND** persists across view switches

#### Scenario: Component state scope
- **WHEN** state is UI-only (hover, expanded)
- **THEN** it SHALL use React useState
- **AND** not be stored in global or module stores

---

### Requirement: Extensibility Design

The application SHALL support easy module addition.

#### Scenario: Adding a new module
- **WHEN** developer needs to add a new module (e.g., Calendar)
- **THEN** they create src/modules/calendar/ directory
- **AND** export CalendarView from index.ts
- **AND** add navigation item to NAV_ITEMS
- **AND** add display:none block in MainContent.tsx
- **AND** add view type to ViewType union

#### Scenario: Core unchanged on new module
- **WHEN** new module is added following the process
- **THEN** AppShell core logic is NOT modified
- **AND** Sidebar core logic is NOT modified
- **AND** other modules are NOT modified
