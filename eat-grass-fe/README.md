# Eat Grass Frontend

Frontend application for the Eat Grass meal planning platform, built with React, TypeScript, and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and HMR
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - High-quality React components
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── BottomNav.tsx   # Bottom navigation
│   ├── FeedPost.tsx    # Social feed post component
│   ├── Footer.tsx      # Footer component
│   ├── GlowCard.tsx    # Animated card component
│   ├── MealCard.tsx    # Meal card component
│   ├── Navbar.tsx      # Top navigation
│   ├── PriceComparisonModal.tsx  # Price comparison dialog
│   └── Sidebar.tsx     # Sidebar navigation
├── contexts/           # React contexts
│   └── SidebarContext.tsx
├── data/               # JSON data files
│   ├── deals.json
│   ├── feed.json
│   ├── ingredients.json
│   ├── meals.json
│   ├── nearby_meals.json
│   ├── plan.json
│   ├── profile.json
│   ├── saved_plans.json
│   └── settings.json
├── hooks/              # Custom React hooks
│   └── usePullToRefresh.ts
├── layouts/            # Layout components
│   └── AppLayout.tsx
├── lib/                # Utility functions
│   └── utils.ts
├── pages/              # Page components
│   ├── Deals.tsx
│   ├── Home.tsx
│   ├── MealDetails.tsx
│   ├── NearbyBudgetMeals.tsx
│   ├── Planner.tsx
│   ├── Profile.tsx
│   ├── SavedPlans.tsx
│   ├── Settings.tsx
│   └── SocialFeed.tsx
├── App.tsx             # Main app component with routes
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-first design with bottom navigation
- 🔄 Pull-to-refresh functionality
- 🎯 Component-based architecture
- ♿ Accessible components with Radix UI
- 🎭 Custom animations and transitions
- 📊 Data-driven meal planning

## Development

The app uses Vite for fast development with Hot Module Replacement (HMR). Changes to components will reflect immediately in the browser.

### Component Development

Components are organized by feature and type:
- `ui/` - Base UI components from shadcn/ui
- Feature components in the root of `components/`
- Page components in `pages/`

### Styling

The project uses Tailwind CSS with a custom configuration. Component styles are co-located with components using Tailwind utility classes.

### TypeScript

Strict TypeScript is enabled. Ensure all components and functions are properly typed.

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory, optimized and ready for deployment.

## ESLint Configuration

The project uses ESLint with TypeScript support. To expand the configuration with type-aware rules, see the [main README](../README.md) for examples.
