import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'green'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load from localStorage or default to 'light'
    const saved = localStorage.getItem('app-theme')
    return (saved as Theme) || 'light'
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    
    // Remove all theme classes first
    root.classList.remove('theme-green', 'theme-light')
    body.classList.remove('theme-green', 'theme-light')
    
    if (theme === 'green') {
      root.classList.add('theme-green')
      body.classList.add('theme-green')
      body.style.background = 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)'
      body.style.backgroundColor = ''
    } else {
      root.classList.add('theme-light')
      body.classList.add('theme-light')
      body.style.background = ''
      body.style.backgroundColor = '#FFFDF6'
    }
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

