## ADDED Requirements

### Requirement: Consistent Focus Indicators

系統 SHALL 為所有可互動元素提供一致的 focus 指示器。

#### Scenario: 鍵盤導航

- **WHEN** 用戶使用 Tab 鍵導航
- **THEN** 當前 focus 的元素 SHALL 顯示 ring 指示器
- **AND** ring 顏色使用 primary 色
- **AND** ring 在淺色與深色主題下都清晰可見

### Requirement: Consistent Hover Effects

系統 SHALL 為所有可互動元素提供一致的 hover 效果。

#### Scenario: 滑鼠懸停

- **WHEN** 滑鼠懸停在可互動元素上
- **THEN** 元素 SHALL 有視覺變化（背景色/透明度）
- **AND** 變化 SHALL 有平滑過渡（150ms）
