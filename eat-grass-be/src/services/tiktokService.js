/**
 * TikTok Service
 * 
 * Handles TikTok video scraping using Apify's TikTok Scraper.
 * Searches for restaurant/food related videos based on location or search terms.
 */

import { ApifyClient } from 'apify-client';

// TikTok Scraper Actor ID
const TIKTOK_SCRAPER_ACTOR_ID = 'clockworks/free-tiktok-scraper';

// TikTok client - initialized lazily
let apifyClient = null;

/**
 * Get or create the Apify client
 */
function getApifyClient() {
  if (!apifyClient) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new Error('APIFY_API_TOKEN environment variable is not set');
    }
    apifyClient = new ApifyClient({ token });
  }
  return apifyClient;
}

/**
 * Search for TikTok videos about restaurants/food
 * 
 * @param {Object} options - Search options
 * @param {string} options.searchQuery - Search query (e.g., "restaurant Kuala Lumpur")
 * @param {string} options.location - Location to search for
 * @param {number} options.maxVideos - Maximum number of videos to fetch (default: 20)
 * @returns {Object} Search results with TikTok videos
 */
export async function searchTikTokVideos(options = {}) {
  const { searchQuery, location, maxVideos = 20 } = options;

  // Build search query
  let query = searchQuery || '';
  if (location) {
    query = `${location} food restaurant`.trim();
  }
  if (!query) {
    query = 'food restaurant review';
  }

  try {
    console.log('Searching TikTok for:', query);

    const client = getApifyClient();

    // Prepare actor input for TikTok scraper
    const input = {
      // Search by hashtag or keyword
      searchQueries: [query],
      
      // Number of results
      resultsPerPage: maxVideos,
      
      // Only get videos (not users or hashtags)
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
    };

    console.log('Running TikTok scraper with input:', JSON.stringify(input, null, 2));

    // Run the actor
    const run = await client.actor(TIKTOK_SCRAPER_ACTOR_ID).call(input);

    console.log(`TikTok scraper finished with status: ${run.status}`);

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Found ${items.length} TikTok videos`);

    // Transform the data
    const videos = transformTikTokData(items);

    return {
      videos,
      totalResults: videos.length,
      searchQuery: query,
      scrapedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('TikTok scraping error:', error);
    
    if (error.message.includes('API token')) {
      throw new Error('Invalid or missing Apify API token');
    }
    
    throw new Error(`Failed to search TikTok videos: ${error.message}`);
  }
}

/**
 * Transform TikTok data into our application format
 * 
 * @param {Array} rawData - Raw data from Apify
 * @returns {Array} Transformed video data
 */
function transformTikTokData(rawData) {
  return rawData.map((item, index) => {
    // Extract video info
    const video = item.videoMeta || item;
    const author = item.authorMeta || item.author || {};
    const stats = item.stats || item.statistics || {};
    const music = item.musicMeta || item.music || {};

    return {
      id: item.id || `video-${index + 1}`,
      
      // Video details
      description: item.text || item.description || item.desc || '',
      
      // Video URLs
      videoUrl: item.videoUrl || item.webVideoUrl || video.downloadAddr || null,
      webUrl: item.webVideoUrl || `https://www.tiktok.com/@${author.name}/video/${item.id}`,
      embedUrl: item.id ? `https://www.tiktok.com/embed/v2/${item.id}` : null,
      
      // Thumbnail/Cover
      coverUrl: item.covers?.default || item.cover || video.cover || null,
      dynamicCover: item.covers?.dynamic || video.dynamicCover || null,
      
      // Duration
      duration: video.duration || item.duration || 0,
      
      // Author info
      author: {
        id: author.id || null,
        username: author.name || author.uniqueId || author.nickname || 'Unknown',
        displayName: author.nickName || author.nickname || author.name || 'Unknown',
        avatar: author.avatar || author.avatarThumb || null,
        verified: author.verified || false,
        followers: author.fans || author.followerCount || 0,
      },
      
      // Stats
      stats: {
        likes: stats.diggCount || stats.likeCount || item.diggCount || 0,
        comments: stats.commentCount || item.commentCount || 0,
        shares: stats.shareCount || item.shareCount || 0,
        plays: stats.playCount || item.playCount || 0,
      },
      
      // Music
      music: {
        title: music.musicName || music.title || null,
        author: music.musicAuthor || music.authorName || null,
        url: music.playUrl || null,
      },
      
      // Hashtags
      hashtags: extractHashtags(item.text || item.description || ''),
      
      // Timestamps
      createTime: item.createTime ? new Date(item.createTime * 1000).toISOString() : null,
    };
  }).filter(video => video.webUrl || video.embedUrl); // Only include videos with valid URLs
}

/**
 * Extract hashtags from text
 * 
 * @param {string} text - Text to extract hashtags from
 * @returns {Array} List of hashtags
 */
function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#[\w\u0080-\uFFFF]+/g);
  return matches ? matches.map(tag => tag.slice(1)) : [];
}

/**
 * Format number for display (e.g., 1.2K, 3.5M)
 * 
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

