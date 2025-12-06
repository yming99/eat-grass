import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react'
import GlowCard from './GlowCard'
import { cn } from '@/lib/utils'

interface FeedPostProps {
  id: string
  userName: string
  userAvatar: string
  timestamp: string
  xpAmount?: number
  xpMessage?: string
  badgeImage?: string
  photo?: string
  likes: number
  comments: number
  isLiked?: boolean
}

export default function FeedPost({
  userName,
  userAvatar,
  timestamp,
  xpAmount,
  xpMessage,
  badgeImage,
  photo,
  likes,
  comments,
  isLiked = false,
}: FeedPostProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [showXPBurst, setShowXPBurst] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    if (!liked && xpAmount) {
      setShowXPBurst(true)
      setTimeout(() => setShowXPBurst(false), 2000)
    }
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <GlowCard className="mb-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-xs text-white/70">{formatTime(timestamp)}</p>
          </div>
        </div>

        {/* XP Message */}
        {xpMessage && (
          <div className="relative">
            <p className="text-white font-medium text-lg">
              {xpMessage}
            </p>
            {xpAmount && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-300 font-bold text-xl">+{xpAmount} XP</span>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
            )}
            {showXPBurst && xpAmount && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <div className="text-yellow-300 font-bold text-2xl drop-shadow-lg">
                    +{xpAmount} XP
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badge */}
        {badgeImage && (
          <div className="relative">
            <img
              src={badgeImage}
              alt="Badge"
              className="w-24 h-24 object-contain animate-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
          </div>
        )}

        {/* Photo */}
        {photo && (
          <div className="rounded-xl overflow-hidden">
            <img
              src={photo}
              alt="Post"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center gap-6 pt-2 border-t border-white/20">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-2 transition-colors',
              liked ? 'text-red-400' : 'text-white/70 hover:text-red-400'
            )}
          >
            <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 text-white/70 hover:text-white">
            <MessageCircle className="h-5 w-5" />
            <span>{comments}</span>
          </button>
          <button className="flex items-center gap-2 text-white/70 hover:text-white ml-auto">
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </GlowCard>
  )
}

