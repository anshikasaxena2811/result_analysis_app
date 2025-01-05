import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export function ThemeProvider({ children }) {
  const { mode } = useSelector((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(mode)
  }, [mode])

  return children
}