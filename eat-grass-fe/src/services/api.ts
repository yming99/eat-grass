/**
 * API Service
 * 
 * Handles all communication with the backend API.
 * Provides functions for:
 * - Generating meal plans via Claude LLM
 * - Scraping restaurant menus via Apify
 */

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Parameters for generating a meal plan
 */
export interface MealPlanParams {
  budget: number;
  days: number;
  people: number;
  diet: string;
  location?: string; // Optional location for restaurant scraping
}

/**
 * Ingredient in a meal
 */
export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

/**
 * Single meal in the plan
 */
export interface Meal {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  image: string;
  cost: number;
  calories: number;
  protein: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  isRestaurant: boolean;
  restaurantName?: string;
  ingredients: MealIngredient[];
  tags: string[];
}

/**
 * Day's meal data
 */
export interface DayData {
  day: number;
  dayName: string;
  meals: Meal[];
  dayCost: number;
}

/**
 * Grocery list item
 */
export interface GroceryItem {
  name: string;
  totalQuantity: number;
  unit: string;
  estimatedCost: number;
}

/**
 * Complete meal plan response
 */
export interface MealPlanResponse {
  totalCost: number;
  budget: number;
  days: number;
  people: number;
  diet: string;
  daysData: DayData[];
  summary: {
    avgCostPerDay: number;
    avgCostPerPerson: number;
    avgCostPerMeal: number;
    totalMeals: number;
    homeCooked: number;
    restaurant: number;
  };
  groceryList: GroceryItem[];
  tips: string[];
}

/**
 * Restaurant menu item
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  calories: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  image: string | null;
  popular: boolean;
}

/**
 * Restaurant data
 */
export interface Restaurant {
  id: string;
  name: string;
  rating: number | null;
  ratingCount: number;
  deliveryFee: number | null;
  deliveryTime: string | null;
  cuisines: string[];
  address: string;
  isOpen: boolean;
  menuItems: MenuItem[];
  categories: string[];
}

/**
 * Menu scrape response
 */
export interface MenuScrapeResponse {
  restaurants: Restaurant[];
  totalRestaurants: number;
  scrapedAt: string;
}

/**
 * Generate a meal plan using Claude LLM
 * 
 * @param params - Meal plan parameters
 * @returns Generated meal plan
 */
export async function generateMealPlan(params: MealPlanParams): Promise<MealPlanResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-meal-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate meal plan:', error);
    throw error;
  }
}

/**
 * Scrape restaurant menu from Just Eat
 * 
 * @param location - Location/postcode to search
 * @param restaurantUrl - Direct restaurant URL (optional)
 * @returns Scraped menu data
 */
export async function scrapeRestaurantMenu(
  location: string,
  restaurantUrl?: string
): Promise<MenuScrapeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scrape-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location, restaurantUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to scrape menu:', error);
    throw error;
  }
}

/**
 * Check API health status
 * 
 * @returns Health status
 */
export async function checkApiHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error('API is not healthy');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
}

/**
 * Nearby restaurant from Google Places
 */
export interface NearbyRestaurant {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number | null;
    lng: number | null;
  };
  distance: number | null;
  rating: number | null;
  reviewCount: number;
  priceLevel: number | null;
  priceRange: string | null;
  phone: string | null;
  website: string | null;
  operatingHours: Array<{ day: string; hours: string }> | null;
  isOpen: boolean | null;
  categories: string[];
  images: string[];
  mainImage: string | null;
  reviews: Array<{
    author: string;
    rating: number | null;
    text: string;
    date: string | null;
  }>;
  description: string | null;
  url: string | null;
}

/**
 * Nearby restaurants search response
 */
export interface NearbyRestaurantsResponse {
  restaurants: NearbyRestaurant[];
  totalResults: number;
  location: string;
  searchedAt: string;
}

/**
 * TikTok video author
 */
export interface TikTokAuthor {
  id: string | null;
  username: string;
  displayName: string;
  avatar: string | null;
  verified: boolean;
  followers: number;
}

/**
 * TikTok video stats
 */
export interface TikTokStats {
  likes: number;
  comments: number;
  shares: number;
  plays: number;
}

/**
 * TikTok video
 */
export interface TikTokVideo {
  id: string;
  description: string;
  videoUrl: string | null;
  webUrl: string;
  embedUrl: string | null;
  coverUrl: string | null;
  dynamicCover: string | null;
  duration: number;
  author: TikTokAuthor;
  stats: TikTokStats;
  music: {
    title: string | null;
    author: string | null;
    url: string | null;
  };
  hashtags: string[];
  createTime: string | null;
}

/**
 * TikTok search response
 */
export interface TikTokSearchResponse {
  videos: TikTokVideo[];
  totalResults: number;
  searchQuery: string;
  scrapedAt: string;
}

/**
 * Search for TikTok videos about restaurants/food
 * 
 * @param options - Search options
 * @returns TikTok videos
 */
export async function searchTikTokVideos(
  options: { searchQuery?: string; location?: string; maxVideos?: number }
): Promise<TikTokSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tiktok-videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to search TikTok videos:', error);
    throw error;
  }
}

/**
 * Search for nearby restaurants using Google Places
 * 
 * @param location - Location to search (e.g., "Sunway Pyramid, Malaysia")
 * @param options - Search options
 * @returns Nearby restaurants
 */
export async function searchNearbyRestaurants(
  location: string,
  options?: { maxResults?: number; searchType?: string }
): Promise<NearbyRestaurantsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nearby-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        maxResults: options?.maxResults || 20,
        searchType: options?.searchType || 'restaurant',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to search nearby restaurants:', error);
    throw error;
  }
}

