import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Navigation, Trophy, Save, User } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/find-food-nearby', label: 'Nearby', icon: Navigation },
  { path: '/grocery-game', label: 'Game', icon: Trophy },
  { path: '/saved-plans', label: 'Saved', icon: Save },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t border-gray-200 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px]',
                isActive
                  ? 'text-[#A0C878]'
                  : 'text-gray-600'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              {isActive && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

