# Change: Add E2E Testing Framework

## Why

To ensure the reliability of core user flows (Feed management and Library interaction) and prevent regressions, we need an automated End-to-End (E2E) testing framework.

## What Changes

- Add `playwright` and `@playwright/test` dependencies.
- Create `e2e/` directory structure with config, fixtures, and tests.
- Add `test:e2e` script to `package.json`.
- Add GitHub Actions workflow for CI execution.
- Add E2E tests for:
  - Feed: Add subscription, view article, save as note.
  - Library: View list, select note, view preview.

## Impact

- Affected specs: Core (System Capabilities)
- Affected code: New `e2e/` directory, `package.json`, `.github/workflows/`
