# Thinkrium 技術債清理與 UX 改進任務

> 根據 2026-01-22 Code Review 結果整理
> 適用於 Jules AI 自動執行

---

## 🎯 執行順序建議

```
Phase 1: 基礎設施（已完成 ✅）
├── ✅ refactor-preload-types
├── ✅ refactor-duplicate-logic
├── ✅ unify-error-handling
└── ✅ add-logging-system

Phase 2: UX 改進（待執行）
├── 5. improve-loading-ux      [2h]   - 品牌化載入 + Skeleton
├── 6. improve-empty-states    [1.5h] - 空狀態引導設計
├── 7. unify-visual-feedback   [1h]   - 統一 hover/focus 樣式
├── 8. add-micro-animations    [2h]   - 頁面/列表動畫
└── 9. apply-virtual-list      [2h]   - 虛擬列表效能
```

---

## 📋 Phase 2: UX 改進

### Task 5: Improve Loading UX

**OpenSpec**: `openspec/changes/improve-loading-ux/`

**目標**：
1. 建立品牌化 SplashScreen 元件
2. 建立 Skeleton 元件用於資料載入狀態
3. 為 FeedItemList 加入 Skeleton placeholder

**涉及檔案**：
- `src/renderer/src/App.tsx`
- `src/renderer/src/components/SplashScreen.tsx` (NEW)
- `src/renderer/src/components/ui/Skeleton.tsx` (NEW)
- `src/renderer/src/modules/feed/components/FeedItemList.tsx`

**驗收標準**：
- [ ] SplashScreen 包含 Logo 與載入動畫
- [ ] Skeleton 具有 pulse 動畫效果
- [ ] 資料載入時顯示 Skeleton 而非空白

---

### Task 6: Improve Empty States

**OpenSpec**: `openspec/changes/improve-empty-states/`

**目標**：
1. 重新設計 EmptyState 元件，支援圖標、CTA 按鈕
2. 為 Feed、Library、Project 各模組提供專屬配置

**涉及檔案**：
- `src/renderer/src/components/ui/EmptyState.tsx`
- `src/renderer/src/modules/feed/components/FeedItemList.tsx`
- `src/renderer/src/modules/library/LibraryView.tsx`

**驗收標準**：
- [ ] 空狀態包含引導圖標與說明文字
- [ ] CTA 按鈕功能正常

---

### Task 7: Unify Visual Feedback

**OpenSpec**: `openspec/changes/unify-visual-feedback/`

**目標**：
1. 在 index.css 定義統一的 focus ring 樣式
2. 確保所有可互動元素有一致的 hover 過渡

**涉及檔案**：
- `src/renderer/src/index.css`
- `src/renderer/src/components/ui/button.tsx`
- `src/renderer/src/modules/feed/components/FeedItemCard.tsx`

**驗收標準**：
- [ ] 鍵盤 Tab 導航時 focus ring 清晰可見
- [ ] hover 過渡平滑（150ms）

---

### Task 8: Add Micro Animations

**OpenSpec**: `openspec/changes/add-micro-animations/`

**目標**：
1. 頁面切換淡入淡出效果
2. 列表項目 staggered fadeIn
3. Toast 進出動畫優化

**涉及檔案**：
- `tailwind.config.js`
- `src/renderer/src/components/layout/MainContent.tsx`
- `src/renderer/src/components/ui/Toast.tsx`

**驗收標準**：
- [ ] 視圖切換有淡入效果
- [ ] 動畫流暢無卡頓

---

### Task 9: Apply Virtual List

**OpenSpec**: `openspec/changes/apply-virtual-list/`

**目標**：
1. 將 FeedItemList 改為虛擬列表渲染
2. 確保鍵盤導航（J/K）正常

**涉及檔案**：
- `src/renderer/src/modules/feed/components/FeedItemList.tsx`

**驗收標準**：
- [ ] 500+ 項目時捲動流暢（>55 FPS）
- [ ] 鍵盤導航自動捲動到選中項目

---

## 🔗 相關資源

- **Repository**: https://github.com/roland-zbl/thinkrium
- **Code Review Report**: `thinkrium_code_review.md`
- **OpenSpec 指南**: `openspec/AGENTS.md`

---

## 📝 執行說明

每個 Task 對應一個 OpenSpec change，Jules 可使用以下指令：

```bash
# 檢視 change 詳情
openspec show improve-loading-ux

# 完成後歸檔
openspec archive improve-loading-ux --yes
```
