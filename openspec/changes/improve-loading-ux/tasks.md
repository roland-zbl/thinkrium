## 1. SplashScreen 元件

- [ ] 1.1 建立 `src/renderer/src/components/SplashScreen.tsx`
  - 顯示應用 Logo（可使用 Lucide 圖標或 SVG）
  - 包含載入進度指示器
  - 淡入淡出動畫
- [ ] 1.2 更新 `App.tsx` 使用 SplashScreen 替代簡單 spinner

## 2. Skeleton 元件

- [ ] 2.1 建立 `src/renderer/src/components/ui/Skeleton.tsx`
  - 支援 `variant`: text / circular / rectangular
  - 支援自定義 width / height
  - 使用 CSS animation pulse 效果
- [ ] 2.2 建立 `FeedItemSkeleton.tsx` 用於列表載入狀態

## 3. 整合到模組

- [ ] 3.1 更新 `FeedItemList.tsx`：
  - loading 狀態時顯示 3-5 個 FeedItemSkeleton
- [ ] 3.2 更新 `NoteList.tsx`（如存在）：
  - loading 狀態時顯示 Skeleton

## 4. Verification

- [ ] 4.1 執行 `npm run dev` 驗證 SplashScreen 顯示
- [ ] 4.2 模擬慢速網路確認 Skeleton 效果
- [ ] 4.3 確認動畫流暢無卡頓
