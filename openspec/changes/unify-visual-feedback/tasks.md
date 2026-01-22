## 1. 基礎樣式定義

- [ ] 1.1 在 `index.css` 添加 focus-visible 基礎樣式：
  ```css
  @layer base {
    *:focus-visible {
      @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
    }
  }
  ```
- [ ] 1.2 定義統一的 hover transition class

## 2. 元件更新

- [ ] 2.1 更新 `button.tsx`：
  - 確保 focus-visible 樣式生效
  - 添加 transition-colors duration-150
- [ ] 2.2 更新 `FeedItemCard.tsx`：
  - hover 時背景變化（bg-muted/50）
  - 選中狀態視覺區分
- [ ] 2.3 更新 `FolderNode.tsx`：
  - hover 時展開箭頭高亮
  - focus 狀態可見

## 3. Verification

- [ ] 3.1 使用鍵盤 Tab 導航所有可互動元素
- [ ] 3.2 確認 focus ring 在淺色/深色主題下都可見
- [ ] 3.3 確認 hover 過渡平滑無閃爍
