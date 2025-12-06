import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Menu, X, Home, Calendar, Tag, Save, Users, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/contexts/SidebarContext'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/planner', label: 'Planner', icon: Calendar },
  { path: '/deals', label: 'Deals', icon: Tag },
  { path: '/saved-plans', label: 'Saved Plans', icon: Save },
  { path: '/social-feed', label: 'Social Feed', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-[60px] md:top-20 h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] bg-white shadow-md transition-all duration-300 z-40',
        isExpanded ? 'w-[220px]' : 'w-[72px]'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="self-end m-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-softGreen hover:shadow-sm'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

