---
name: ui-development
description: UI 開發專家。當用戶要求建立、修改或審查 React/Tailwind UI 元件時自動啟用。確保產出符合無障礙、高效能與現代設計標準。
---

# UI 開發 Skill

> **核心使命**：產出生產就緒、無障礙、高效能的 UI 程式碼。

參考來源：[UI Skills](https://www.ui-skills.com/)

---

## 技術棧約束

### 樣式
- **Tailwind CSS 優先**：所有樣式使用 Tailwind
- **方形元素**：使用 `size-*` 而非分開的 `w-*` 和 `h-*`
- **行動優先**：使用 `h-dvh` 而非 `h-screen`

### 元件庫
- **無障礙優先**：只使用無障礙元件庫（Radix、React Aria、Base UI）
- **圖示**：使用 Lucide React，必須包含 `aria-label` 或 `aria-hidden`
- ❌ **禁止**：重建瀏覽器原生行為（焦點管理、鍵盤導航）

---

## 互動與 UX

### 安全性
- 破壞性操作必須使用 `AlertDialog` 確認
- ❌ **禁止**：封鎖輸入框的貼上功能

### 載入狀態
- **初次載入**：使用 Skeleton 骨架
- **操作進行中**：使用 LoadingButton

### 錯誤處理
- 錯誤訊息必須放在觸發元素旁邊
- 空狀態必須提供明確的「下一步行動」

---

## 動畫約束

### 核心規則
- ❌ **除非明確要求，否則不加動畫**
- 只動畫 compositor 屬性：`transform`、`opacity`
- ❌ **禁止**：動畫 `width`、`height`、`margin` 等 layout 屬性

### 時機
- 進場動畫：使用 `ease-out`
- 互動回饋：不超過 200ms
- 必須尊重 `prefers-reduced-motion`

### 效能
- ❌ **禁止**：大面積 `blur()` 或 `backdrop-filter` 動畫

---

## 排版與佈局

### 文字
- **標題**：使用 `text-balance`、`tracking-tight`
- **內文**：使用 `text-pretty`
- **數字**：使用 `tabular-nums`
- **截斷**：使用 `truncate` 或 `line-clamp`

### Z-Index 規範
使用固定層級，禁止任意數值：
```
base:     0
dropdown: 10
sticky:   20
modal:    30
popover:  40
toast:    50
```

---

## 效能與程式碼品質

### 渲染邏輯
- ❌ **禁止**：用 `useEffect` 處理可以純渲染表達的邏輯
- 優先使用派生狀態而非 effect

### 設計簡潔
- ❌ **禁止**：未經要求加入漸層或發光效果
- 使用 Tailwind 預設陰影層級

---

## 反模式

| ❌ 錯誤做法                   | ✅ 正確做法                 |
| :--------------------------- | :------------------------- |
| 自己寫 Modal/Dropdown        | 使用 Radix/React Aria      |
| `h-screen`                   | `h-dvh`                    |
| 動畫 `height`                | 動畫 `transform: scaleY()` |
| 任意 z-index（如 `z-[999]`） | 使用固定層級系統           |
| 未經要求加動畫               | 預設無動畫，要求時才加     |
| `useEffect` 計算派生值       | 直接在 render 中計算       |
