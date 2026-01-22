# Change: Optimize CJK Typography

## Why

The application needs better Chinese/Japanese/Korean (CJK) font support to ensure consistent and readable typography for Traditional and Simplified Chinese content.

## What Changes

- Reorder font stack in Tailwind config to prioritize CJK fonts
- Use Google Fonts for Noto Sans TC/SC to ensure consistent cross-platform rendering
- Optionally add `@font-face` declarations for local/offline fallback

## Impact

- Affected specs: ui
- Affected code:
  - `tailwind.config.js`
  - `src/renderer/src/index.css`
  - `src/renderer/index.html` (optional: add Google Fonts link)
