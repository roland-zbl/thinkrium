# Change: Refactor Preload Types - 消除 any 類型

## Why

目前 `electron/preload.ts` 中大量使用 `any` 類型（約 15 處），導致：
- IDE 自動補全失效
- 編譯時無法檢測類型錯誤
- 新功能開發時需要頻繁查閱文件

## What Changes

- 將 `preload.ts` 中所有 `any` 替換為 `@shared/types` 的具體類型
- 確保 `window.api` 的類型定義完整且準確
- 更新 `env.d.ts` 中的 API 類型聲明

## Impact

- Affected specs: `core`
- Affected code:
  - `electron/preload.ts`
  - `src/renderer/src/env.d.ts`
  - `src/shared/types/index.ts`
