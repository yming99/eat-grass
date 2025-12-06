# Eat Grass 🌱

A modern meal planning application that helps you discover delicious, budget-friendly meal plans tailored to your preferences and dietary needs.

## Features

- 🍽️ **Meal Planning** - Create and customize meal plans based on your preferences, budget, and dietary needs. Generate grocery lists and export meal plans.

- 👨‍🍳 **Cook at Home** - Browse recipes, find ingredients, and plan your home-cooked meals. Features include:

  - Recipe search and filtering (by category, diet type, prep time)
  - Ingredient suggestions with prices
  - Quick access to meal planner and grocery list
  - Detailed recipe cards with nutritional information

- 📍 **Find Food Nearby** - Discover recommended restaurants, takeout options, and grocery stores near your location. Features include:

  - Location-based search
  - Recommended shops sorted by distance
  - Full menu display with prices for each item
  - Shop details (location, distance, operating hours)
  - Popular items highlighting

- 💰 **Budget-Friendly** - Find affordable meals and compare prices across different options

- 📱 **Social Feed** - Share and discover meal ideas from the community with an Instagram-style feed interface

- 💾 **Save Plans** - Save your favorite meal plans for later use

- 👤 **Profile Management** - Personalize your experience with profile settings

- ⚙️ **Settings** - Customize app preferences including currency, units, and notifications

## Project Structure

```
eat-grass/
├── eat-grass-fe/          # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── data/          # JSON data files
│   │   └── lib/           # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd eat-grass-fe
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - UI component library

## Pages

- `/` - Home page with quick access to Cook and Find Food Nearby
- `/planner` - Meal planner - Create personalized meal plans based on budget, days, people, and diet preferences
- `/cook` - Cook at Home - Browse recipes, search ingredients, filter by category/diet/prep time, and access meal planning tools
- `/find-food-nearby` - Find Food Nearby - Discover recommended shops and restaurants near your location with full menus and prices
- `/meal/:id` - Meal details page
- `/social-feed` - Social feed - Instagram-style feed to share and discover meal ideas
- `/saved-plans` - Saved meal plans
- `/profile` - User profile
- `/settings` - App settings

## License

This project is private and proprietary.
