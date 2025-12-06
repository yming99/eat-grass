# Eat Grass Backend API

Backend API for the Eat Grass meal planner application. Provides intelligent meal planning using Claude LLM and restaurant menu scraping via Apify.

## Features

- **AI Meal Planning**: Uses Claude LLM to generate personalized meal plans
- **Restaurant Menu Scraping**: Integrates with Apify's Just Eat scraper for real restaurant data
- **Budget Optimization**: Creates meal plans that fit within user's budget
- **Dietary Preferences**: Supports various diet types (vegetarian, vegan, keto, etc.)

## Setup

### 1. Install Dependencies

```bash
cd eat-grass-be
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:

```env
# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Apify API Token for Just Eat Menu Scraper
APIFY_API_TOKEN=your_apify_api_token_here

# Server Configuration
PORT=3001
```

### 3. Get API Keys

**Anthropic API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

**Apify API Token:**
1. Go to [apify.com](https://apify.com)
2. Create an account or sign in
3. Navigate to Settings > Integrations
4. Copy your API token

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API status.

### Generate Meal Plan
```
POST /api/generate-meal-plan
```

Request body:
```json
{
  "budget": 100,
  "days": 7,
  "people": 2,
  "diet": "normal",
  "location": "50000 KL"
}
```

Response: Complete meal plan with meals, grocery list, and budget tips.

### Scrape Restaurant Menu
```
POST /api/scrape-menu
```

Request body:
```json
{
  "location": "50000 KL",
  "restaurantUrl": "https://just-eat.com/restaurant/..."
}
```

Response: Restaurant menu data with items and prices.

## Project Structure

```
eat-grass-be/
├── src/
│   ├── index.js              # Express server entry point
│   └── services/
│       ├── claudeService.js  # Claude LLM integration
│       └── apifyService.js   # Apify Just Eat scraper
├── env.example               # Environment variables template
├── package.json              # Dependencies
└── README.md                 # This file
```

## Technologies

- **Express.js**: Web server framework
- **Anthropic SDK**: Claude LLM API client
- **Apify Client**: Restaurant menu scraping
- **dotenv**: Environment configuration

