## 1. 虛擬列表實作

- [ ] 1.1 在 `FeedItemList.tsx` 引入 `@tanstack/react-virtual`：
  ```tsx
  import { useVirtualizer } from '@tanstack/react-virtual'
  ```
- [ ] 1.2 設定 virtualizer：
  - estimateSize: 基於 FeedItemCard 高度（約 100px）
  - overscan: 5-10 條項目
- [ ] 1.3 更新 render 邏輯使用 virtualizer.getVirtualItems()

## 2. 鍵盤導航整合

- [ ] 2.1 確保 J/K 鍵導航時自動捲動到新選中項目
- [ ] 2.2 使用 virtualizer.scrollToIndex() 實現
- [ ] 2.3 測試邊界情況（首項、末項）

## 3. 效能測試

- [ ] 3.1 匯入 500+ 條 RSS 項目測試資料
- [ ] 3.2 測量捲動 FPS，確保 >55fps
- [ ] 3.3 測量記憶體佔用，確認無洩漏

## 4. Verification

- [ ] 4.1 驗證快速捲動無閃爍
- [ ] 4.2 驗證鍵盤導航順暢
- [ ] 4.3 驗證選中項目在虛擬區域外時正確捲動進入視野
