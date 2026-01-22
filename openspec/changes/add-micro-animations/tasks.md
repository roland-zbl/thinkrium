## 1. Tailwind 動畫定義

- [ ] 1.1 在 `tailwind.config.js` 添加 keyframes：
  - `fadeIn`: opacity 0 → 1
  - `fadeOut`: opacity 1 → 0
  - `slideInFromBottom`: translateY(10px) → 0
- [ ] 1.2 定義對應的 animation utilities

## 2. 頁面過渡

- [ ] 2.1 更新 `MainContent.tsx`：
  - 視圖切換時應用 fadeIn animation
  - 使用 CSS transition 或 React Transition Group

## 3. 列表動畫

- [ ] 3.1 更新 `FeedItemList.tsx`：
  - 項目首次渲染時使用 staggered fadeIn
  - 考慮使用 CSS animation-delay 實現
- [ ] 3.2 控制動畫只在首次載入觸發，避免滾動時重複

## 4. Toast 動畫

- [ ] 4.1 更新 `Toast.tsx`：
  - 進入動畫：slideInFromBottom
  - 離開動畫：fadeOut

## 5. Verification

- [ ] 5.1 驗證動畫流暢無卡頓
- [ ] 5.2 確認動畫不影響效能（使用 GPU acceleration）
- [ ] 5.3 確認減少動效偏好設定時動畫適當減少
