import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Loader2, 
  MapPin, 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Music2,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Hash,
  RefreshCw,
  Video
} from 'lucide-react'
import { searchTikTokVideos, type TikTokVideo } from '@/services/api'

/**
 * Format number for display (e.g., 1.2K, 3.5M)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format duration in seconds to mm:ss
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Social Feed Page
 * 
 * Displays TikTok videos about restaurants and food based on user's search.
 * Users can search by location or keywords to find relevant food content.
 */
export default function SocialFeed() {
  // Search inputs
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  
  // Videos state
  const [videos, setVideos] = useState<TikTokVideo[]>([])
  
  // Loading and error states
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Feed container ref for scroll
  const feedRef = useRef<HTMLDivElement>(null)

  /**
   * Handle search form submission
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim() && !location.trim()) {
      setError('Please enter a search term or location')
      return
    }

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await searchTikTokVideos({
        searchQuery: searchQuery.trim() || undefined,
        location: location.trim() || undefined,
        maxVideos: 20
      })
      
      setVideos(results.videos)
    } catch (err) {
      console.error('Search failed:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to search TikTok videos. Please try again.'
      )
      setVideos([])
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Quick search with preset queries
   */
  const handleQuickSearch = async (query: string) => {
    setSearchQuery(query)
    setLocation('')
    
    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await searchTikTokVideos({
        searchQuery: query,
        maxVideos: 20
      })
      
      setVideos(results.videos)
    } catch (err) {
      console.error('Search failed:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to search TikTok videos. Please try again.'
      )
      setVideos([])
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Open video in TikTok
   */
  const openInTikTok = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Food Videos
          </h1>
        </div>
        <p className="text-neutral-700 font-medium">
          Discover trending restaurant and food videos from TikTok
        </p>
      </div>

      {/* Search Form */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2 font-semibold">
                <Search className="h-4 w-4 text-primary" />
                Search Videos
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="e.g., nasi lemak, bubble tea, street food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isSearching}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                Location (Optional)
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Kuala Lumpur, Penang, Johor Bahru..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isSearching}
              />
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching TikTok...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Videos
                </>
              )}
            </Button>
          </form>

          {/* Quick Search Tags */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending searches:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Malaysian food', 'Cafe hopping KL', 'Street food', 'Food review', 'Hidden gems'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickSearch(tag)}
                  disabled={isSearching}
                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Search Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-lg font-bold text-neutral-800 mb-2">
              Searching TikTok...
            </p>
            <p className="text-neutral-600">
              Finding the best food videos for you
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Results */}
      {!isSearching && videos.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800">
              {videos.length} Videos Found
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              className="text-primary"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Video Feed - Centered */}
          <div ref={feedRef} className="flex flex-col items-center gap-6">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className="w-full max-w-md overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-green-50/30"
              >
                {/* Video Header - Author Info */}
                <div className="p-4 flex items-center gap-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-green-50/50">
                  {video.author.avatar ? (
                    <img
                      src={video.author.avatar}
                      alt={video.author.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold">
                      {video.author.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {video.author.displayName}
                      </p>
                      {video.author.verified && (
                        <Badge className="bg-primary text-white text-[10px] px-1">✓</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">@{video.author.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInTikTok(video.webUrl)}
                    className="text-primary border-primary/20 hover:bg-primary/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Video Thumbnail/Preview */}
                <div 
                  className="relative aspect-[9/16] bg-neutral-100 cursor-pointer group"
                  onClick={() => openInTikTok(video.webUrl)}
                >
                  {/* Cover Image */}
                  {video.coverUrl || video.dynamicCover ? (
                    <img
                      src={video.dynamicCover || video.coverUrl || ''}
                      alt={video.description || 'TikTok video'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-green-100">
                      <Video className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>

                  {/* TikTok Logo Overlay */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                    TikTok
                  </div>

                  {/* Duration Badge */}
                  {video.duration > 0 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Stats Overlay - Right Side */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <div className="flex flex-col items-center text-white drop-shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold mt-1">{formatNumber(video.stats.likes)}</span>
                    </div>
                    <div className="flex flex-col items-center text-white drop-shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold mt-1">{formatNumber(video.stats.comments)}</span>
                    </div>
                    <div className="flex flex-col items-center text-white drop-shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold mt-1">{formatNumber(video.stats.shares)}</span>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <CardContent className="p-4 space-y-3">
                  {/* Description */}
                  {video.description && (
                    <p className="text-sm text-neutral-800 line-clamp-3">
                      {video.description}
                    </p>
                  )}

                  {/* Hashtags */}
                  {video.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.hashtags.slice(0, 5).map((tag, idx) => (
                        <Badge 
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                          onClick={() => handleQuickSearch(`#${tag}`)}
                        >
                          <Hash className="h-3 w-3 mr-0.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Music */}
                  {video.music.title && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Music2 className="h-3 w-3" />
                      <span className="truncate">
                        {video.music.title} - {video.music.author || 'Original Sound'}
                      </span>
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-primary/10 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(video.stats.plays)} views
                    </span>
                    {video.createTime && (
                      <span>
                        {new Date(video.createTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Watch on TikTok Button */}
                  <Button
                    onClick={() => openInTikTok(video.webUrl)}
                    className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch on TikTok
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No Results */}
      {!isSearching && hasSearched && videos.length === 0 && !error && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl w-fit mx-auto mb-6">
              <Video className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-lg font-bold text-neutral-800 mb-2">
              No videos found
            </p>
            <p className="text-neutral-600">
              Try a different search term or location
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!isSearching && !hasSearched && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl w-fit mx-auto mb-6">
              <Video className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-lg font-bold text-neutral-800 mb-2">
              Discover Food Videos
            </p>
            <p className="text-neutral-600 mb-4">
              Search for restaurant reviews, food tours, and more from TikTok
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Malaysian food', 'Cafe KL', 'Street food'].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(tag)}
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
