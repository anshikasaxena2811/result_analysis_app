import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import axios from 'axios'
import {
  BarChart2,
  FileUp,
  LogOut,
  Menu,
  User,
  Users,
  X,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import { clearUser } from '../store/userSlice'

export function Navbar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useSelector((state) => state.user)

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/users/logout', {}, {
        withCredentials: true
      })
      dispatch(clearUser())
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Protected nav items (only for logged-in users)
  const protectedNavItems = [
    {
      name: 'Upload',
      path: '/upload',
      icon: <FileUp className="h-5 w-5" />,
      roles: ['admin', 'faculty', 'student']
    },
    {
      name: 'Results',
      path: '/results',
      icon: <BarChart2 className="h-5 w-5" />,
      roles: ['admin', 'faculty', 'student']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
      roles: ['admin', 'faculty', 'student']
    },
  ]

  // Admin-specific nav item
  const adminNavItem = {
    name: 'Admin Panel',
    path: '/admin-panel',
    icon: <Settings className="h-5 w-5" />,
    roles: ['admin']
  }

  // Public nav items (visible to all visitors)
  const publicNavItems = [
    {
      name: 'Team',
      path: '/team',
      icon: <Users className="h-5 w-5" />,
    }
  ]

  // Add the admin panel for admin users
  const filteredProtectedItems = user 
    ? protectedNavItems.filter(item => item.roles.includes(user.role))
    : [];

  // Combine adminNavItem for admin users
  const allNavItems = user
    ? [...filteredProtectedItems, ...(user.role === 'admin' ? [adminNavItem] : []), ...publicNavItems]
    : publicNavItems;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex mr-14 ml-14 h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Result Analysis</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {allNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  location.pathname === item.path 
                    ? "text-foreground" 
                    : "text-foreground/60"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-md md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Logo for mobile */}
        <div className="flex md:hidden">
          <Link to="/" className="ml-4 flex items-center space-x-2">
            <span className="font-bold">Result Analysis</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden md:inline-flex"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {allNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block rounded-md px-3 py-2",
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-foreground/60 hover:bg-secondary/50 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
            {user && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
