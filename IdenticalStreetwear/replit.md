# IDENTICAL - Mozambican Streetwear E-commerce Platform

## Overview

IDENTICAL is a full-stack e-commerce platform for authentic Mozambican streetwear. The platform enables users to browse collections, purchase products, and manage orders, while administrators can manage products, collections, coupons, and order fulfillment. The brand emphasizes urban culture, authenticity, and local street style with the tagline "Be Different, Be Classic."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Path aliases configured via tsconfig (`@/`, `@shared/`, `@assets/`)

**State Management & Data Fetching**
- React Query (TanStack Query) for server state management, caching, and API calls
- Local state with React hooks (useState, useEffect)
- localStorage for cart persistence (client-side)

**Styling Approach**
- Tailwind CSS with custom configuration for the brand
- Shadcn UI component library (New York style variant)
- Custom CSS variables for theming (light/dark mode support)
- Design guidelines emphasize urban minimalism, bold typography, and mobile-first approach
- Typography: Inter (primary), Space Grotesk (logo/special headings)

**Form Handling & Validation**
- React Hook Form for performant form state management
- Zod schemas for runtime validation
- Integration via @hookform/resolvers

**Key UI Patterns**
- Sheet/Drawer components for cart (side panel)
- Dialog modals for admin operations
- Accordion components for FAQs and product details
- Tabs for admin dashboard sections and user account pages
- Responsive grid layouts (2-3-4 columns for products)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Session-based authentication using Passport.js (Local Strategy)
- Custom middleware for auth checks (requireAuth, requireAdmin)

**Authentication System**
- Email/username + password authentication
- Scrypt for password hashing with salts
- Session management with express-session
- Persistent sessions stored in-memory (MemoryStore) or PostgreSQL (connect-pg-simple)
- Configurable session secrets via environment variables

**API Design**
- RESTful endpoints under `/api/*`
- Public routes: products, collections (read-only)
- Protected routes: orders, user profile (authentication required)
- Admin routes: CRUD operations for products, collections, coupons, order management
- Webhook endpoint: `/api/paysuite/webhook` for payment confirmations

**Business Logic Layers**
- Storage interface (IStorage) abstracts data access
- Separate modules for authentication (auth.ts), routing (routes.ts), and storage (storage.ts)
- In-memory storage implementation for development (with interfaces ready for database migration)

### Data Storage

**Database Strategy**
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts` with Zod integration
- Tables: users, products, collections, orders, orderItems, coupons
- Currently configured for Neon serverless PostgreSQL via `@neondatabase/serverless`
- Migration system via drizzle-kit

**Schema Highlights**
- UUIDs for primary keys (gen_random_uuid)
- Relational structure: products → collections, orders → users, orderItems → orders/products
- JSON arrays for product variants (sizes, colors, images)
- Timestamp tracking (createdAt) on all entities
- Boolean flags for active status, featured products, admin users

**Data Persistence**
- Cart data stored in localStorage (client-side)
- Session data persisted via connect-pg-simple (server-side)
- Product images referenced via URLs (stored in attached_assets directory)

### External Dependencies

**Payment Integration**
- PaySuite gateway for Mozambican payment methods (M-Pesa, eMola, credit/debit cards)
- Sandbox/production mode support
- Webhook integration for automatic payment confirmation
- Order status workflow: pendente → confirmado → enviado → entregue

**Third-Party Services**
- Google Fonts CDN (Inter, Space Grotesk)
- Image hosting via local assets (attached_assets directory)
- Email notifications (mentioned in requirements but not yet implemented)

**Development Tools**
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- TypeScript for type checking across client/server/shared code
- ESBuild for production server bundling
- PostCSS with Tailwind for CSS processing

**Key NPM Packages**
- UI: Radix UI primitives (30+ component packages)
- Forms: react-hook-form, @hookform/resolvers, zod
- Utilities: clsx, class-variance-authority, tailwind-merge
- Icons: lucide-react
- Carousel: embla-carousel-react
- Date handling: date-fns
- Security: crypto (built-in), passport, passport-local

### Deployment Configuration

**Environment Variables**
- DATABASE_URL: PostgreSQL connection string (required)
- SESSION_SECRET: Secret key for session encryption (defaults provided for development)
- NODE_ENV: production/development toggle

**Build Process**
- Client: Vite builds to `dist/public`
- Server: ESBuild bundles to `dist/index.js`
- Serves static files in production mode
- Development mode uses Vite dev server with HMR

**File Structure**
- `/client`: React frontend code
- `/server`: Express backend code
- `/shared`: Shared types and schemas (Drizzle + Zod)
- `/attached_assets`: Static images and brand assets
- `/migrations`: Database migration files (Drizzle)