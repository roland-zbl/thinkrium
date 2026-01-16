# Change: Refactor UI Tokens

## Why

Currently, there are two systems for defining colors and styles: `tokens.ts` (JS object) and `index.css` (CSS variables with Tailwind). This duplication leads to maintenance issues and inconsistency.

## What Changes

- Unify all styling definitions to use CSS variables and Tailwind CSS.
- Remove `tokens.ts` completely.
- Refactor all components using `tokens.colors` inline styles to use Tailwind classes.
- Add missing semantic colors (`success`, `warning`) to CSS variables.

## Impact

- Affected specs: UI
- Affected code: All renderer components using `tokens`.
