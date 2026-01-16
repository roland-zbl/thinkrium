# Change: Update Project Store to use IPC

## Why

The current Project Store relies on mock data and incomplete logic. We need to connect it to the existing Electron IPC backend to fetch real project data, handle project status updates, and load project-specific materials (Project Items).

## What Changes

- **Frontend Types**: Update `DbProject` to match backend schema; Add `ProjectItem` type.
- **Project Store**:
    - Remove TODOs.
    - Implement `activeProjectItems` state.
    - Implement `fetchProjectItems(projectId)` action.
    - Ensure `fetchProjects` uses real backend data.
- **Project UI**:
    - `ProjectPageView.tsx` will fetch items on mount/change.
    - Display real materials instead of mock data.

## Impact

- Affected specs: `project`
- Affected code:
    - `src/renderer/src/types/index.ts`
    - `src/renderer/src/modules/project/store/project.store.ts`
    - `src/renderer/src/modules/project/ProjectPageView.tsx`
