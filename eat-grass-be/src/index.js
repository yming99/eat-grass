/**
 * Eat Grass Backend Server
 * 
 * Main entry point for the backend API.
 * Provides endpoints for:
 * - Meal plan generation using Claude LLM
 * - Restaurant menu scraping using Apify Just Eat scraper
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateMealPlan } from './services/claudeService.js';
import { scrapeRestaurantMenu } from './services/apifyService.js';
import { searchNearbyRestaurants } from './services/googlePlacesService.js';
import { searchTikTokVideos } from './services/tiktokService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eat Grass API is running' });
});

/**
 * Generate meal plan endpoint
 * 
 * Takes user parameters (budget, days, people, diet) and generates
 * a personalized meal plan using Claude LLM with scraped menu data.
 */
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const { budget, days, people, diet, location } = req.body;

    // Validate required fields
    if (!budget || !days || !people || !diet) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['budget', 'days', 'people', 'diet']
      });
    }

    console.log('Generating meal plan with params:', { budget, days, people, diet, location });

    // Step 1: Scrape restaurant menu data from Just Eat (optional, based on location)
    let menuData = null;
    if (location) {
      try {
        console.log('Scraping menu data for location:', location);
        menuData = await scrapeRestaurantMenu(location);
        console.log('Menu data scraped successfully');
      } catch (scrapeError) {
        console.warn('Failed to scrape menu data, proceeding without it:', scrapeError.message);
      }
    }

    // Step 2: Generate meal plan using Claude LLM
    const mealPlan = await generateMealPlan({
      budget: parseFloat(budget),
      days: parseInt(days),
      people: parseInt(people),
      diet,
      menuData
    });

    res.json(mealPlan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({
      error: 'Failed to generate meal plan',
      message: error.message
    });
  }
});

/**
 * Scrape restaurant menu endpoint
 * 
 * Scrapes menu data from Just Eat for a given location.
 */
app.post('/api/scrape-menu', async (req, res) => {
  try {
    const { location, restaurantUrl } = req.body;

    if (!location && !restaurantUrl) {
      return res.status(400).json({
        error: 'Missing required field',
        required: ['location or restaurantUrl']
      });
    }

    console.log('Scraping menu for:', location || restaurantUrl);

    const menuData = await scrapeRestaurantMenu(location, restaurantUrl);

    res.json(menuData);
  } catch (error) {
    console.error('Error scraping menu:', error);
    res.status(500).json({
      error: 'Failed to scrape menu',
      message: error.message
    });
  }
});

/**
 * Search TikTok videos endpoint
 * 
 * Uses Apify's TikTok Scraper to find food/restaurant videos.
 */
app.post('/api/tiktok-videos', async (req, res) => {
  try {
    const { searchQuery, location, maxVideos } = req.body;

    if (!searchQuery && !location) {
      return res.status(400).json({
        error: 'Missing required field',
        required: ['searchQuery or location']
      });
    }

    console.log('Searching TikTok videos for:', searchQuery || location);

    const results = await searchTikTokVideos({
      searchQuery,
      location,
      maxVideos: maxVideos || 20
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching TikTok videos:', error);
    res.status(500).json({
      error: 'Failed to search TikTok videos',
      message: error.message
    });
  }
});

/**
 * Search nearby restaurants endpoint
 * 
 * Uses Apify's Google Places Crawler to find restaurants near a location.
 */
app.post('/api/nearby-restaurants', async (req, res) => {
  try {
    const { location, maxResults, searchType } = req.body;

    if (!location) {
      return res.status(400).json({
        error: 'Missing required field',
        required: ['location']
      });
    }

    console.log('Searching nearby restaurants for:', location);

    const results = await searchNearbyRestaurants(location, {
      maxResults: maxResults || 20,
      searchType: searchType || 'restaurant'
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching nearby restaurants:', error);
    res.status(500).json({
      error: 'Failed to search nearby restaurants',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🥗 Eat Grass API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

