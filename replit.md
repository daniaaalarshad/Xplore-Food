# Xplore Food

A food discovery platform built with Next.js where users can explore restaurants by city, view menus, photos, and reviews. Business owners can authenticate to add and manage their listings.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with custom Express server
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom orange/green theme
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Icons**: Lucide React
- **Data Fetching**: React Query (@tanstack/react-query)

## Architecture

### Custom Server (`server.ts`)
- Express server on port 5000
- Handles auth middleware (Replit Auth via passport/OIDC)
- Serves API routes under `/api/*`
- Delegates all other requests to Next.js

### Database Schema (`shared/schema.ts`)
- **users** - Replit Auth user accounts
- **sessions** - Auth session storage
- **cities** - Supported cities for restaurant discovery
- **restaurants** - Restaurant listings with details
- **menu_categories** - Menu sections per restaurant
- **menu_items** - Individual menu items with pricing
- **restaurant_photos** - Photo gallery per restaurant
- **reviews** - User reviews with star ratings
- **favorites** - User bookmarked restaurants

### API Routes (`server/routes/`)
- `cities.ts` - GET /api/cities
- `restaurants.ts` - GET /api/restaurants (with filters), GET /api/restaurants/:id
- `reviews.ts` - GET/POST /api/reviews/:restaurantId
- `favorites.ts` - GET /api/favorites, POST /api/favorites/:restaurantId
- `dashboard.ts` - CRUD for business owner restaurant management

### Pages (`app/`)
- `/` - Home page with hero, cuisine grid, featured restaurants
- `/restaurants` - Restaurant listing with search, filters, pagination
- `/restaurants/[id]` - Restaurant detail with menu, reviews, photos
- `/dashboard` - Business owner dashboard
- `/dashboard/add` - Add new restaurant form
- `/dashboard/edit/[id]` - Edit restaurant form
- `/dashboard/menu/[id]` - Menu management (categories and items)

### Auth Integration (`server/replit_integrations/auth/`)
- Replit OIDC authentication flow
- Session management with PostgreSQL store
- `isAuthenticated` middleware for protected routes

## Color Theme
- Primary (Orange): #FF6B35
- Secondary (Green): #10B981
- Amber (Ratings): #F59E0B
- Dark backgrounds: gray-900

## Development
- Run: `npm run dev`
- Database push: `npm run db:push`
- Port: 5000
