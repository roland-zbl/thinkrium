## ADDED Requirements

### Requirement: Branded Splash Screen

應用程式 SHALL 在初始化期間顯示品牌化的載入畫面。

#### Scenario: 應用程式啟動

- **WHEN** 應用程式啟動並進行初始化
- **THEN** 顯示包含 Logo 的 Splash Screen
- **AND** Splash Screen 包含載入動畫
- **AND** 初始化完成後以淡出效果過渡到主介面

### Requirement: Skeleton Loading States

系統 SHALL 在資料載入期間顯示 Skeleton placeholder。

#### Scenario: Feed 列表載入

- **WHEN** Feed 項目正在載入中
- **THEN** 顯示 Skeleton placeholder 卡片
- **AND** Skeleton 具有 pulse 動畫效果
- **WHEN** 資料載入完成
- **THEN** Skeleton 被實際內容替換

#### Scenario: Library 列表載入

- **WHEN** 筆記列表正在載入中
- **THEN** 顯示 Skeleton placeholder
