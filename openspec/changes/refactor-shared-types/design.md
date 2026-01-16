## Context
Fixing dependency inversion between Main and Renderer.

## Decisions
- Create `src/shared/types` as a sibling to `src/renderer`.
- Use `@shared` alias for cleaner imports.
- Create module-specific `types.ts` in Renderer to re-export shared types.
