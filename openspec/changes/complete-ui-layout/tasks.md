## 1. 佈局組件開發

### 1.1 CSS 基礎樣式
- [ ] 1.1.1 從 `prototype/styles.css` 複製 CSS 變量到 `src/index.css`
- [ ] 1.1.2 複製佈局相關樣式（.sidebar, .main-content, .aux-panel）

### 1.2 AppLayout 組件
- [ ] 1.2.1 創建 `src/components/layout/AppLayout.tsx`
- [ ] 1.2.2 實現三欄 flex 佈局
- [ ] 1.2.3 支援 children props 渲染主內容區

### 1.3 Sidebar 組件
- [ ] 1.3.1 創建 `src/components/layout/Sidebar.tsx`
- [ ] 1.3.2 實現導航項目列表
- [ ] 1.3.3 實現 active 狀態切換
- [ ] 1.3.4 （可選）實現訂閱源分組顯示

### 1.4 AuxPanel 組件
- [ ] 1.4.1 創建 `src/components/layout/AuxPanel.tsx`
- [ ] 1.4.2 實現基礎面板結構

---

## 2. 整合與驗證

### 2.1 整合到 App.tsx
- [ ] 2.1.1 修改 `src/App.tsx` 使用 AppLayout
- [ ] 2.1.2 將 FeedPage 作為主內容區渲染

### 2.2 驗證
- [ ] 2.2.1 運行 `npm run dev` 確認啟動正常
- [ ] 2.2.2 對比 prototype 確認視覺一致性
- [ ] 2.2.3 測試導航項目點擊交互
