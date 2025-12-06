import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function GlowCard({ children, className, onClick }: GlowCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      className={cn(
        'relative rounded-2xl p-5',
        'bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600',
        'shadow-[0_0_30px_rgba(120,0,255,0.6),inset_0_0_20px_rgba(255,255,255,0.1)]',
        'transition-all duration-300',
        isPressed && 'scale-[0.98] translate-y-1',
        className
      )}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {children}
    </div>
  )
}

