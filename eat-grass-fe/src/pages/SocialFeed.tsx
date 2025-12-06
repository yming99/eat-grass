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

export default function SocialFeed() {
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
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

  // Use feed data directly (removed XP/badge enhancements for Instagram-like layout)
  const enhancedFeed = feedData

  // Handle scroll for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = feedRef.current
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
    <div className="bg-neutral-50 min-h-screen pb-20 relative">
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-lg p-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Feed */}
      <div
        ref={feedRef}
        className="max-h-[calc(100vh-200px)] overflow-y-auto py-4"
      >
        <div className="max-w-[614px] mx-auto">
          {enhancedFeed.map((post) => (
            <FeedPost
              key={post.id}
              id={post.id}
              userName={post.userName}
              userAvatar={post.userAvatar}
              timestamp={post.timestamp}
              content={post.content}
              photo={post.image}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </div>
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
