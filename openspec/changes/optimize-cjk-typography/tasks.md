## 1. Font Configuration

- [ ] 1.1 In `tailwind.config.js`, update font stack:
  ```javascript
  fontFamily: {
    sans: [
      '"Noto Sans TC"',
      '"Noto Sans SC"',
      'Inter',
      'PingFang TC',
      'Microsoft JhengHei',
      'system-ui',
      'sans-serif'
    ]
  }
  ```

## 2. Font Loading

- [ ] 2.1 Add Google Fonts link to `src/renderer/index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  ```
- [ ] 2.2 Alternatively, add `@import` to `index.css` if HTML modification is not preferred

## 3. Testing

- [ ] 3.1 Verify Chinese characters render with correct font
- [ ] 3.2 Test both Traditional (繁體) and Simplified (简体) Chinese
- [ ] 3.3 Verify font fallback works when offline
- [ ] 3.4 Check font loading performance (no visible FOUT)
