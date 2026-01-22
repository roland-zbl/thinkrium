## MODIFIED Requirements

### Requirement: Feed Item List Performance

系統 SHALL 使用虛擬列表渲染以確保大量項目時的效能。

#### Scenario: 大量項目捲動

- **WHEN** Feed 列表包含 >500 條項目
- **THEN** 捲動 SHALL 維持 >55 FPS
- **AND** 只渲染可視區域內的項目 + overscan

#### Scenario: 鍵盤導航與虛擬列表

- **WHEN** 用戶按 J/K 導航
- **THEN** 選中項目 SHALL 自動捲動進入可視區域
- **AND** 捲動平滑無跳躍

#### Scenario: 虛擬列表記憶體管理

- **WHEN** 用戶持續捲動列表
- **THEN** 系統 SHALL 正確清理超出視野的 DOM 節點
- **AND** 記憶體佔用 SHALL 保持穩定
