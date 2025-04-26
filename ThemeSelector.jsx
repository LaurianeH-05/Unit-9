import { useEffect, useState } from 'react'

export default function ThemeSelector() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  )

  const themes = {
    light: { 
      '--bg': '#ffffff',
      '--text': '#333333',
      '--primary': '#007bff'
    },
    dark: { 
      '--bg': '#1a1a1a',
      '--text': '#ffffff',
      '--primary': '#0d6efd'
    },
    // Add more themes as needed
  }

  useEffect(() => {
    const root = document.documentElement
    // Apply theme variables
    Object.entries(themes[theme]).forEach(([varName, value]) => {
      root.style.setProperty(varName, value)
    })
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <select 
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="theme-select"
    >
      <option value="light">☀️ Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  )
}