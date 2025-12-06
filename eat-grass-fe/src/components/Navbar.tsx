import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import profileData from '@/data/profile.json'

export default function Navbar() {
  const navigate = useNavigate()
  const initials = profileData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="h-[60px] md:h-20 bg-white shadow-md flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Section - Logo */}
        <Link to="/" className="text-2xl font-bold text-[#A0C878] flex-shrink-0">
          eat-grss
        </Link>

        {/* Center Section - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search ingredients…"
              className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Right Section - Avatar Dropdown */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/saved-plans')}>
                Saved Plans
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

