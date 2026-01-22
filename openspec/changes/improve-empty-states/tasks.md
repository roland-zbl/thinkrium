## 1. EmptyState 元件重構

- [ ] 1.1 更新 `EmptyState.tsx` 支援以下 props：
  - `icon`: Lucide React icon component
  - `title`: 主標題
  - `description`: 描述文字
  - `action`: { label: string, onClick: () => void }
- [ ] 1.2 添加淡入動畫效果

## 2. 各模組空狀態配置

- [ ] 2.1 Feed 模組 - 無訂閱：
  - 圖標：Rss
  - 標題：「尚無訂閱源」
  - CTA：「新增訂閱」
- [ ] 2.2 Feed 模組 - 無項目：
  - 圖標：Inbox
  - 標題：「沒有文章」
  - 描述：「選擇的來源目前沒有新內容」
- [ ] 2.3 Library 模組：
  - 圖標：BookOpen
  - 標題：「資料庫為空」
  - CTA：「從 Feed 保存文章」
- [ ] 2.4 Project 模組：
  - 圖標：FolderOpen
  - 標題：「尚無專案」
  - CTA：「建立專案」

## 3. Verification

- [ ] 3.1 清除測試資料驗證各模組空狀態
- [ ] 3.2 確認 CTA 按鈕功能正常
