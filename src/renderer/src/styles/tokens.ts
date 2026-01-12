/**
 * Design Tokens 系統
 * 所有視覺數值必須引用此 Tokens 或 Tailwind 變數，禁止寫死數值。
 */
export const tokens = {
  colors: {
    // 語義化顏色
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142, 71%, 45%)', // 保持不變或也用 var
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(var(--destructive))',

    // 背景層級
    bgBase: 'hsl(var(--background))',
    bgElevated: 'hsl(var(--card))',
    bgSubtle: 'hsl(var(--accent))', // Accent usually works for subtle bg

    // 文字層級
    textPrimary: 'hsl(var(--foreground))',
    textSecondary: 'hsl(var(--muted-foreground))',
    textMuted: 'hsl(var(--muted-foreground))' // Mapped to same for now, or define var(--text-muted)
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },

  typography: {
    fontFamily: "'Inter', 'PingFang SC', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px'
    }
  },

  animations: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  }
}
