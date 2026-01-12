import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

type ResolvedTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'kb-theme-mode'

export function useTheme(): {
    themeMode: ThemeMode
    resolvedTheme: ResolvedTheme
    setThemeMode: (mode: ThemeMode) => void
    toggleTheme: () => void
} {
    // 從 localStorage 讀取初始值，預設為 system
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY)
        return (saved as ThemeMode) || 'system'
    })

    // 計算實際應用的主題
    const getResolvedTheme = useCallback((): ResolvedTheme => {
        if (themeMode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return themeMode
    }, [themeMode])

    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getResolvedTheme)

    // 更新 DOM 和 localStorage
    const applyTheme = useCallback((theme: ResolvedTheme) => {
        document.documentElement.setAttribute('data-theme', theme)
        setResolvedTheme(theme)
    }, [])

    // 設定主題模式
    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode)
        localStorage.setItem(THEME_STORAGE_KEY, mode)
    }, [])

    // 切換主題（light -> dark -> system -> light）
    const toggleTheme = useCallback(() => {
        const nextMode: ThemeMode = 
            themeMode === 'light' ? 'dark' : 
            themeMode === 'dark' ? 'system' : 'light'
        setThemeMode(nextMode)
    }, [themeMode, setThemeMode])

    // 監聽主題變化
    useEffect(() => {
        applyTheme(getResolvedTheme())
    }, [themeMode, applyTheme, getResolvedTheme])

    // 監聽系統主題變化
    useEffect(() => {
        if (themeMode !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (): void => {
            applyTheme(mediaQuery.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [themeMode, applyTheme])

    // 初始化時應用主題
    useEffect(() => {
        applyTheme(getResolvedTheme())
    }, [])

    return { themeMode, resolvedTheme, setThemeMode, toggleTheme }
}
