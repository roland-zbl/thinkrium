## MODIFIED Requirements

### Requirement: Empty State Display

系統 SHALL 在無資料時顯示**引導性**的空狀態畫面。

#### Scenario: Feed 無訂閱源

- **WHEN** 用戶沒有任何訂閱源
- **THEN** 顯示空狀態畫面
- **AND** 包含「新增訂閱」CTA 按鈕
- **AND** 包含引導圖標與說明文字

#### Scenario: Library 無筆記

- **WHEN** Library 沒有任何筆記
- **THEN** 顯示空狀態畫面
- **AND** 說明如何從 Feed 保存文章

#### Scenario: 搜尋無結果

- **WHEN** 搜尋沒有匹配結果
- **THEN** 顯示「無搜尋結果」空狀態
- **AND** 建議調整搜尋關鍵字
