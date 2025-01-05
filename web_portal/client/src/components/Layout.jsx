import { ThemeToggle } from './ThemeToggle'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      <main>{children}</main>
    </div>
  )
} 