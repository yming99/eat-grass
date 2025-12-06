/**
 * Claude LLM Service
 * 
 * Handles communication with Claude API for intelligent meal plan generation.
 * Uses the Anthropic SDK to create personalized meal plans based on:
 * - User budget constraints
 * - Number of days and people
 * - Dietary preferences
 * - Available restaurant menu data (from Apify scraping)
 */

import Anthropic from '@anthropic-ai/sdk';

// Anthropic client - initialized lazily to ensure env vars are loaded
let anthropic = null;

/**
 * Get or create the Anthropic client
 * Lazy initialization ensures dotenv has loaded the API key
 */
function getAnthropicClient() {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

/**
 * Generate a personalized meal plan using Claude LLM
 * 
 * @param {Object} params - Meal plan parameters
 * @param {number} params.budget - Total budget in RM
 * @param {number} params.days - Number of days to plan for
 * @param {number} params.people - Number of people
 * @param {string} params.diet - Diet type (normal, vegetarian, high-protein, etc.)
 * @param {Object|null} params.menuData - Scraped restaurant menu data (optional)
 * @returns {Object} Generated meal plan
 */
export async function generateMealPlan({ budget, days, people, diet, menuData }) {
  // Build the prompt with menu data context if available
  const menuContext = menuData ? buildMenuContext(menuData) : '';
  
  const systemPrompt = `You are a professional meal planner and nutritionist. Your task is to create detailed, practical meal plans that are:
- Budget-conscious and cost-effective
- Nutritionally balanced
- Easy to prepare
- Tailored to dietary preferences

You must respond with ONLY valid JSON, no other text. The JSON must follow the exact structure specified.`;

  const userPrompt = `Create a meal plan with the following requirements:

BUDGET: RM ${budget} total
DURATION: ${days} days
PEOPLE: ${people} person(s)
DIET TYPE: ${diet}

${menuContext ? `AVAILABLE RESTAURANT OPTIONS:\n${menuContext}\n` : ''}

Generate a complete meal plan with breakfast, lunch, and dinner for each day.
For each meal, include:
- Name of the dish
- Estimated cost in RM
- Calories (approximate)
- Protein content in grams
- Preparation time in minutes
- Key ingredients with quantities and costs
- Whether it's from a restaurant or home-cooked

IMPORTANT: Respond with ONLY this JSON structure, no markdown, no explanation:

{
  "totalCost": <number>,
  "budget": ${budget},
  "days": ${days},
  "people": ${people},
  "diet": "${diet}",
  "daysData": [
    {
      "day": 1,
      "dayName": "Day 1",
      "meals": [
        {
          "id": "meal-1-breakfast",
          "name": "Meal Name",
          "mealType": "breakfast",
          "description": "Brief description",
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          "cost": <number>,
          "calories": <number>,
          "protein": <number>,
          "prepTime": <number>,
          "cookTime": <number>,
          "servings": ${people},
          "isRestaurant": <boolean>,
          "restaurantName": "Restaurant Name or null",
          "ingredients": [
            {"name": "ingredient", "quantity": <number>, "unit": "unit", "cost": <number>}
          ],
          "tags": ["tag1", "tag2"]
        }
      ],
      "dayCost": <number>
    }
  ],
  "summary": {
    "avgCostPerDay": <number>,
    "avgCostPerPerson": <number>,
    "avgCostPerMeal": <number>,
    "totalMeals": <number>,
    "homeCooked": <number>,
    "restaurant": <number>
  },
  "groceryList": [
    {"name": "ingredient", "totalQuantity": <number>, "unit": "unit", "estimatedCost": <number>}
  ],
  "tips": ["Budget tip 1", "Budget tip 2"]
}`;

  try {
    console.log('Calling Claude API for meal plan generation...');
    
    // Get the Anthropic client (lazy initialization)
    const client = getAnthropicClient();
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    // Extract the text response
    const responseText = message.content[0].text;
    
    // Parse the JSON response
    let mealPlan;
    try {
      // Try to extract JSON from the response (in case there's any extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.log('Raw response:', responseText);
      throw new Error('Failed to parse meal plan response');
    }

    // Validate and enhance the response
    mealPlan = validateAndEnhanceMealPlan(mealPlan, { budget, days, people, diet });

    console.log('Meal plan generated successfully');
    return mealPlan;

  } catch (error) {
    console.error('Claude API error:', error);
    
    // Return a fallback meal plan if API fails
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing Anthropic API key. Please check your configuration.');
    }
    
    throw error;
  }
}

/**
 * Build context string from scraped menu data
 * 
 * @param {Object} menuData - Scraped restaurant menu data
 * @returns {string} Formatted menu context for the prompt
 */
function buildMenuContext(menuData) {
  if (!menuData || !menuData.restaurants || menuData.restaurants.length === 0) {
    return '';
  }

  let context = 'Here are some restaurant options with their menu items and prices:\n\n';

  menuData.restaurants.slice(0, 5).forEach((restaurant, index) => {
    context += `${index + 1}. ${restaurant.name}\n`;
    context += `   Rating: ${restaurant.rating || 'N/A'}\n`;
    context += `   Delivery Fee: RM ${restaurant.deliveryFee || 'N/A'}\n`;
    
    if (restaurant.menuItems && restaurant.menuItems.length > 0) {
      context += '   Menu Items:\n';
      restaurant.menuItems.slice(0, 10).forEach(item => {
        context += `   - ${item.name}: RM ${item.price}\n`;
      });
    }
    context += '\n';
  });

  return context;
}

/**
 * Validate and enhance the meal plan response
 * 
 * @param {Object} mealPlan - Raw meal plan from Claude
 * @param {Object} params - Original parameters
 * @returns {Object} Validated and enhanced meal plan
 */
function validateAndEnhanceMealPlan(mealPlan, params) {
  // Ensure required fields exist
  if (!mealPlan.totalCost) {
    mealPlan.totalCost = calculateTotalCost(mealPlan);
  }

  if (!mealPlan.budget) {
    mealPlan.budget = params.budget;
  }

  if (!mealPlan.days) {
    mealPlan.days = params.days;
  }

  if (!mealPlan.people) {
    mealPlan.people = params.people;
  }

  // Add placeholder images if missing
  const defaultImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'
  ];

  if (mealPlan.daysData) {
    mealPlan.daysData.forEach((day, dayIndex) => {
      if (day.meals) {
        day.meals.forEach((meal, mealIndex) => {
          if (!meal.image) {
            meal.image = defaultImages[(dayIndex + mealIndex) % defaultImages.length];
          }
          // Ensure meal has an ID
          if (!meal.id) {
            meal.id = `meal-${dayIndex + 1}-${meal.mealType || mealIndex}`;
          }
        });
      }
    });
  }

  return mealPlan;
}

/**
 * Calculate total cost from meal plan data
 * 
 * @param {Object} mealPlan - Meal plan object
 * @returns {number} Total cost
 */
function calculateTotalCost(mealPlan) {
  if (!mealPlan.daysData) return 0;
  
  return mealPlan.daysData.reduce((total, day) => {
    if (!day.meals) return total;
    return total + day.meals.reduce((dayTotal, meal) => {
      return dayTotal + (meal.cost || 0);
    }, 0);
  }, 0);
}

