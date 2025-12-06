import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import FeedPost from '@/components/FeedPost'
import feedData from '@/data/feed.json'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { cn } from '@/lib/utils'

const tabs = ['All', 'Team', 'Gym', 'Products']

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState('All')
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)
  const [navbarVisible, setNavbarVisible] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const lastScrollY = useRef(0)

  // Pull to refresh
  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Refreshed feed')
    },
    enabled: true,
  })

  // Enhanced feed data with XP and badges
  const enhancedFeed = feedData.map((post, index) => ({
    ...post,
    xpAmount: index % 3 === 0 ? 120 : undefined,
    xpMessage: index % 3 === 0 ? '+120 XP from Fitness Quest' : undefined,
    badgeImage: index % 3 === 0 ? '/img/badges/fitness-badge.png' : undefined,
  }))

  // Handle scroll for infinite scroll and auto-hide navbar
  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = feedRef.current
        
        // Auto-hide navbar on scroll down
        if (scrollTop > lastScrollY.current && scrollTop > 100) {
          setNavbarVisible(false)
        } else if (scrollTop < lastScrollY.current) {
          setNavbarVisible(true)
        }
        lastScrollY.current = scrollTop
        
        // Infinite scroll trigger (when near bottom)
        if (scrollHeight - scrollTop - clientHeight < 100) {
          // Load more posts
          console.log('Load more posts')
        }
      }
    }

    const feedElement = feedRef.current
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll)
      return () => feedElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle tab swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const diff = startX - currentX
    const threshold = 50
    
    if (Math.abs(diff) > threshold) {
      const currentIndex = tabs.indexOf(activeTab)
      if (diff > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1])
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1])
      }
    }
    
    setIsDragging(false)
    setCurrentX(0)
  }

  const handleTakePhoto = () => {
    setUploadMenuOpen(false)
    // Handle take photo
    alert('Take photo functionality')
  }

  const handleChooseFromGallery = () => {
    setUploadMenuOpen(false)
    // Handle choose from gallery
    alert('Choose from gallery functionality')
  }

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-lg p-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Tabs */}
      <div
        className={cn(
          'sticky top-[60px] md:top-20 bg-white z-40 border-b transition-transform duration-300',
          !navbarVisible && 'md:-translate-y-full'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="space-y-4 px-4 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        {enhancedFeed.map((post) => (
          <FeedPost
            key={post.id}
            id={post.id}
            userName={post.userName}
            userAvatar={post.userAvatar}
            timestamp={post.timestamp}
            xpAmount={post.xpAmount}
            xpMessage={post.xpMessage}
            badgeImage={post.badgeImage}
            photo={post.image}
            likes={post.likes}
            comments={post.comments}
          />
        ))}
      </div>

      {/* Floating Upload Button */}
      <Button
        onClick={() => setUploadMenuOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Camera className="h-6 w-6" />
      </Button>

      {/* Upload Menu Dialog */}
      <Dialog open={uploadMenuOpen} onOpenChange={setUploadMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              onClick={handleTakePhoto}
              variant="outline"
              className="w-full justify-start"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button
              onClick={handleChooseFromGallery}
              variant="outline"
              className="w-full justify-start"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose from Gallery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
