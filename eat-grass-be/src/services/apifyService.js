/**
 * Apify Service
 * 
 * Handles restaurant menu scraping using Apify's Just Eat Restaurant Menu Scraper.
 * Actor ID: easyapi/just-eat-restaurant-menu-scraper
 * 
 * This service fetches menu data from Just Eat to provide real restaurant
 * options for the meal planner.
 */

import { ApifyClient } from 'apify-client';

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Just Eat Menu Scraper Actor ID
const JUST_EAT_ACTOR_ID = 'easyapi/just-eat-restaurant-menu-scraper';

/**
 * Scrape restaurant menu data from Just Eat
 * 
 * @param {string} location - Location/postcode to search for restaurants
 * @param {string} restaurantUrl - Direct URL to a specific restaurant (optional)
 * @returns {Object} Scraped menu data with restaurants and their menu items
 */
export async function scrapeRestaurantMenu(location, restaurantUrl = null) {
  try {
    console.log('Starting Apify actor run for Just Eat scraping...');

    // Prepare actor input based on parameters
    const input = buildActorInput(location, restaurantUrl);

    // Run the actor and wait for it to finish
    const run = await apifyClient.actor(JUST_EAT_ACTOR_ID).call(input, {
      // Set reasonable timeout (5 minutes max)
      timeoutSecs: 300,
      // Memory allocation
      memoryMbytes: 1024,
    });

    console.log(`Actor run finished with status: ${run.status}`);

    // Fetch results from the default dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Scraped ${items.length} restaurant(s) from Just Eat`);

    // Transform the raw data into our format
    const menuData = transformMenuData(items);

    return menuData;

  } catch (error) {
    console.error('Apify scraping error:', error);
    
    if (error.message.includes('API token')) {
      throw new Error('Invalid or missing Apify API token. Please check your configuration.');
    }
    
    throw new Error(`Failed to scrape restaurant menu: ${error.message}`);
  }
}

/**
 * Build actor input configuration
 * 
 * @param {string} location - Location/postcode
 * @param {string} restaurantUrl - Direct restaurant URL (optional)
 * @returns {Object} Actor input configuration
 */
function buildActorInput(location, restaurantUrl) {
  // Base configuration for the scraper
  const input = {
    // Search by location (postcode or area)
    location: location || '',
    
    // Maximum number of restaurants to scrape
    maxRestaurants: 10,
    
    // Include full menu details
    includeMenu: true,
    
    // Include prices
    includePrices: true,
    
    // Include restaurant ratings
    includeRatings: true,
    
    // Proxy configuration for reliability
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  // If a specific restaurant URL is provided, use it
  if (restaurantUrl) {
    input.startUrls = [{ url: restaurantUrl }];
  }

  return input;
}

/**
 * Transform raw Apify data into our application format
 * 
 * @param {Array} rawData - Raw data from Apify actor
 * @returns {Object} Transformed menu data
 */
function transformMenuData(rawData) {
  const restaurants = rawData.map((item, index) => {
    return {
      id: `restaurant-${index + 1}`,
      name: item.name || item.restaurantName || 'Unknown Restaurant',
      rating: item.rating || item.starRating || null,
      ratingCount: item.ratingCount || item.numberOfRatings || 0,
      deliveryFee: parsePrice(item.deliveryFee || item.deliveryCost),
      deliveryTime: item.deliveryTime || item.estimatedDeliveryTime || null,
      cuisines: item.cuisines || item.cuisineTypes || [],
      address: item.address || item.location || '',
      isOpen: item.isOpen !== undefined ? item.isOpen : true,
      menuItems: transformMenuItems(item.menu || item.menuItems || item.items || []),
      categories: extractCategories(item.menu || item.menuItems || item.items || []),
    };
  });

  return {
    restaurants,
    totalRestaurants: restaurants.length,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Transform menu items into our format
 * 
 * @param {Array} menuItems - Raw menu items
 * @returns {Array} Transformed menu items
 */
function transformMenuItems(menuItems) {
  // Handle nested menu structure (categories with items)
  const flattenedItems = [];

  const processItems = (items, category = null) => {
    if (!Array.isArray(items)) return;

    items.forEach(item => {
      // If item has nested items (it's a category)
      if (item.items && Array.isArray(item.items)) {
        processItems(item.items, item.name || item.categoryName);
      } else {
        // It's a menu item
        flattenedItems.push({
          id: item.id || `item-${flattenedItems.length + 1}`,
          name: item.name || item.itemName || 'Unknown Item',
          description: item.description || '',
          price: parsePrice(item.price),
          category: category || item.category || item.categoryName || 'Other',
          calories: item.calories || item.nutritionalInfo?.calories || null,
          isVegetarian: item.isVegetarian || item.dietary?.vegetarian || false,
          isVegan: item.isVegan || item.dietary?.vegan || false,
          isGlutenFree: item.isGlutenFree || item.dietary?.glutenFree || false,
          image: item.image || item.imageUrl || null,
          popular: item.popular || item.isPopular || false,
        });
      }
    });
  };

  processItems(menuItems);

  return flattenedItems;
}

/**
 * Extract unique categories from menu items
 * 
 * @param {Array} menuItems - Menu items
 * @returns {Array} Unique categories
 */
function extractCategories(menuItems) {
  const categories = new Set();

  const processItems = (items) => {
    if (!Array.isArray(items)) return;

    items.forEach(item => {
      if (item.items && Array.isArray(item.items)) {
        // It's a category
        categories.add(item.name || item.categoryName);
        processItems(item.items);
      } else if (item.category || item.categoryName) {
        categories.add(item.category || item.categoryName);
      }
    });
  };

  processItems(menuItems);

  return Array.from(categories);
}

/**
 * Parse price from various formats
 * 
 * @param {any} price - Price in various formats
 * @returns {number|null} Parsed price as number
 */
function parsePrice(price) {
  if (price === null || price === undefined) return null;
  
  if (typeof price === 'number') return price;
  
  if (typeof price === 'string') {
    // Remove currency symbols and parse
    const cleaned = price.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

/**
 * Get cached menu data (if implementing caching)
 * 
 * @param {string} location - Location key
 * @returns {Object|null} Cached data or null
 */
export function getCachedMenuData(location) {
  // TODO: Implement caching with Redis or in-memory cache
  // For now, return null to always fetch fresh data
  return null;
}

/**
 * Cache menu data (if implementing caching)
 * 
 * @param {string} location - Location key
 * @param {Object} data - Data to cache
 */
export function cacheMenuData(location, data) {
  // TODO: Implement caching
  // For now, do nothing
}

