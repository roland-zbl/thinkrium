## ADDED Requirements

### Requirement: Page Transition Animations

系統 SHALL 在視圖切換時提供平滑的過渡動畫。

#### Scenario: 視圖切換

- **WHEN** 用戶從 Feed 切換到 Library
- **THEN** 新視圖 SHALL 以 fadeIn 動畫進入
- **AND** 動畫時長 SHALL 為 150-200ms

### Requirement: List Item Animations

系統 SHALL 為列表項目提供進場動畫。

#### Scenario: 列表首次載入

- **WHEN** Feed 項目列表首次載入
- **THEN** 項目 SHALL 以 staggered 方式依序淡入
- **AND** 後續項目 SHALL 在前一個動畫開始後 50ms 開始

### Requirement: Toast Animations

系統 SHALL 為 Toast 通知提供進出動畫。

#### Scenario: Toast 顯示

- **WHEN** Toast 通知觸發
- **THEN** Toast SHALL 從底部滑入並淡入
- **WHEN** Toast 消失
- **THEN** Toast SHALL 淡出
