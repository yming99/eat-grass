/**
 * Google Places Service
 * 
 * Handles restaurant search using Apify's Google Places Crawler.
 * Actor ID: compass/crawler-google-places
 * 
 * This service finds nearby restaurants based on user location.
 */

import { ApifyClient } from 'apify-client';

// Google Places Crawler Actor ID
const GOOGLE_PLACES_ACTOR_ID = 'compass/crawler-google-places';

// Apify client - initialized lazily to ensure env vars are loaded
let apifyClient = null;

/**
 * Get or create the Apify client
 * Lazy initialization ensures dotenv has loaded the API token
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
 * Search for nearby restaurants using Google Places
 * 
 * @param {string} location - Location to search (e.g., "Sunway Pyramid, Malaysia")
 * @param {Object} options - Search options
 * @param {number} options.maxResults - Maximum number of results (default: 20)
 * @param {string} options.searchType - Type of search (default: "restaurant")
 * @returns {Object} Search results with restaurants
 */
export async function searchNearbyRestaurants(location, options = {}) {
  const { maxResults = 20, searchType = 'restaurant' } = options;

  try {
    console.log('Starting Google Places search for:', location);

    // Build the search query
    const searchQuery = `${searchType}s near ${location}`;

    // Prepare actor input
    const input = {
      // Search query for restaurants near the location
      searchStringsArray: [searchQuery],
      
      // Maximum number of places to crawl
      maxCrawledPlacesPerSearch: maxResults,
      
      // Language for results
      language: 'en',
      
      // Include additional details
      includeWebResults: false,
      
      // Scrape reviews (limited)
      maxReviews: 5,
      
      // Scrape images
      maxImages: 3,
      
      // Proxy configuration
      proxyConfig: {
        useApifyProxy: true,
      },
    };

    console.log('Running Apify actor with input:', JSON.stringify(input, null, 2));

    // Get the Apify client (lazy initialization)
    const client = getApifyClient();

    // Run the actor and wait for it to finish
    const run = await client.actor(GOOGLE_PLACES_ACTOR_ID).call(input);

    console.log(`Actor run finished with status: ${run.status}`);

    // Fetch results from the default dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Found ${items.length} restaurants near ${location}`);

    // Transform the raw data into our format
    const restaurants = transformGooglePlacesData(items, location);

    return {
      restaurants,
      totalResults: restaurants.length,
      location,
      searchedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Google Places search error:', error);
    
    if (error.message.includes('API token')) {
      throw new Error('Invalid or missing Apify API token. Please check your configuration.');
    }
    
    throw new Error(`Failed to search nearby restaurants: ${error.message}`);
  }
}

/**
 * Transform Google Places data into our application format
 * 
 * @param {Array} rawData - Raw data from Apify actor
 * @param {string} searchLocation - The location that was searched
 * @returns {Array} Transformed restaurant data
 */
function transformGooglePlacesData(rawData, searchLocation) {
  return rawData.map((place, index) => {
    // Parse price level (Google uses $ symbols)
    const priceLevel = parsePriceLevel(place.price);
    
    // Parse operating hours
    const operatingHours = parseOperatingHours(place.openingHours);
    
    // Get categories/cuisine types
    const categories = parseCategories(place.categories || place.categoryName);

    return {
      id: place.placeId || `restaurant-${index + 1}`,
      name: place.title || place.name || 'Unknown Restaurant',
      
      // Location details
      address: place.address || place.street || '',
      location: {
        lat: place.location?.lat || null,
        lng: place.location?.lng || null,
      },
      
      // Distance (if available, otherwise estimate from search)
      distance: place.distance || null,
      
      // Ratings
      rating: place.totalScore || place.rating || null,
      reviewCount: place.reviewsCount || 0,
      
      // Price info
      priceLevel: priceLevel,
      priceRange: place.price || null,
      
      // Contact
      phone: place.phone || null,
      website: place.website || null,
      
      // Operating hours
      operatingHours: operatingHours,
      isOpen: place.isOpen !== undefined ? place.isOpen : null,
      
      // Categories and cuisine
      categories: categories,
      
      // Images
      images: parseImages(place.imageUrls || place.images),
      mainImage: place.imageUrl || (place.imageUrls && place.imageUrls[0]) || null,
      
      // Reviews
      reviews: parseReviews(place.reviews),
      
      // Additional info
      description: place.description || null,
      url: place.url || place.googleUrl || null,
      
      // Popular times (if available)
      popularTimes: place.popularTimesHistogram || null,
    };
  });
}

/**
 * Parse price level from various formats
 * 
 * @param {string|number} price - Price indicator
 * @returns {number|null} Price level (1-4)
 */
function parsePriceLevel(price) {
  if (!price) return null;
  
  if (typeof price === 'number') return price;
  
  if (typeof price === 'string') {
    // Count $ symbols
    const dollarCount = (price.match(/\$/g) || []).length;
    if (dollarCount > 0) return Math.min(dollarCount, 4);
    
    // Try parsing as number
    const parsed = parseInt(price);
    if (!isNaN(parsed)) return Math.min(parsed, 4);
  }
  
  return null;
}

/**
 * Parse operating hours into structured format
 * 
 * @param {any} hours - Operating hours data
 * @returns {Object|null} Structured operating hours
 */
function parseOperatingHours(hours) {
  if (!hours) return null;
  
  // If it's already an array of day/hours
  if (Array.isArray(hours)) {
    return hours.map(h => ({
      day: h.day || h.dayOfWeek,
      hours: h.hours || h.time || 'Hours not available',
    }));
  }
  
  // If it's an object with days as keys
  if (typeof hours === 'object') {
    return Object.entries(hours).map(([day, time]) => ({
      day,
      hours: time,
    }));
  }
  
  // If it's a string, return as-is
  if (typeof hours === 'string') {
    return [{ day: 'Hours', hours }];
  }
  
  return null;
}

/**
 * Parse categories/cuisine types
 * 
 * @param {any} categories - Category data
 * @returns {Array} List of categories
 */
function parseCategories(categories) {
  if (!categories) return [];
  
  if (Array.isArray(categories)) {
    return categories.filter(c => c && typeof c === 'string');
  }
  
  if (typeof categories === 'string') {
    return categories.split(',').map(c => c.trim()).filter(Boolean);
  }
  
  return [];
}

/**
 * Parse images into array of URLs
 * 
 * @param {any} images - Image data
 * @returns {Array} List of image URLs
 */
function parseImages(images) {
  if (!images) return [];
  
  if (Array.isArray(images)) {
    return images
      .map(img => typeof img === 'string' ? img : img?.url || img?.imageUrl)
      .filter(Boolean)
      .slice(0, 5); // Limit to 5 images
  }
  
  return [];
}

/**
 * Parse reviews into structured format
 * 
 * @param {any} reviews - Review data
 * @returns {Array} Parsed reviews
 */
function parseReviews(reviews) {
  if (!reviews || !Array.isArray(reviews)) return [];
  
  return reviews.slice(0, 5).map(review => ({
    author: review.name || review.author || 'Anonymous',
    rating: review.stars || review.rating || null,
    text: review.text || review.snippet || '',
    date: review.publishedAtDate || review.date || null,
  }));
}

