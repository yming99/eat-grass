import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedPostProps {
  id: string
  userName: string
  userAvatar: string
  timestamp: string
  content?: string
  photo?: string
  likes: number
  comments: number
  isLiked?: boolean
  isSaved?: boolean
}

export default function FeedPost({
  userName,
  userAvatar,
  timestamp,
  content,
  photo,
  likes,
  comments,
  isLiked = false,
  isSaved = false,
}: FeedPostProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likeCount, setLikeCount] = useState(likes)
  const [showCommentInput, setShowCommentInput] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInDays < 7) return `${diffInDays}d`
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleDoubleClickLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <article className="bg-white border border-neutral-200 rounded-sm mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-neutral-300">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-neutral-200 text-neutral-600 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{userName}</span>
        </div>
        <button className="p-1 hover:opacity-70 transition-opacity">
          <MoreHorizontal className="h-5 w-5 text-neutral-900" />
        </button>
      </div>

      {/* Image */}
      {photo && (
        <div 
          className="relative w-full bg-neutral-100"
          onDoubleClick={handleDoubleClickLike}
        >
          <img
            src={photo}
            alt="Post"
            className="w-full h-auto object-cover"
          />
          {liked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="h-16 w-16 text-white fill-red-500 animate-ping" />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <Heart 
                className={cn(
                  'h-6 w-6 transition-all',
                  liked ? 'fill-red-500 text-red-500' : 'text-neutral-900'
                )} 
              />
            </button>
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <MessageCircle className="h-6 w-6 text-neutral-900" />
            </button>
            <button className="p-1 hover:opacity-70 transition-opacity">
              <Share2 className="h-6 w-6 text-neutral-900" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Bookmark 
              className={cn(
                'h-6 w-6 transition-all',
                saved ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-900'
              )} 
            />
          </button>
        </div>
      </div>

      {/* Likes Count */}
      {likeCount > 0 && (
        <div className="px-4 pb-1">
          <span className="font-semibold text-sm">{likeCount.toLocaleString()} likes</span>
        </div>
      )}

      {/* Caption */}
      {content && (
        <div className="px-4 py-1">
          <p className="text-sm">
            <span className="font-semibold mr-2">{userName}</span>
            <span>{content}</span>
          </p>
        </div>
      )}

      {/* View Comments */}
      {comments > 0 && (
        <button 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="px-4 py-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          View all {comments} comments
        </button>
      )}

      {/* Timestamp */}
      <div className="px-4 py-1 pb-3">
        <span className="text-xs text-neutral-500 uppercase">
          {formatTime(timestamp)}
        </span>
      </div>

      {/* Add Comment Input */}
      <div className="border-t border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Smile className="h-6 w-6 text-neutral-500" />
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 outline-none text-sm placeholder:text-neutral-500"
            onFocus={() => setShowCommentInput(true)}
          />
          <button 
            className={cn(
              "text-sm font-semibold transition-opacity",
              showCommentInput ? "text-blue-500 opacity-100" : "text-blue-300 opacity-0 pointer-events-none"
            )}
          >
            Post
          </button>
        </div>
      </div>
    </article>
  )
}

