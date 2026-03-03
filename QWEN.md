# PALMO-TRANS Calculator Frontend

## Project Overview

A **React 19 + TypeScript + Vite** web application for PALMO-TRANS GmbH, providing an interactive delivery cost calculator with a multi-step wizard interface. The application allows customers to:

1. Enter pickup and delivery addresses (with Google Maps geocoding)
2. Specify package weight and service type (Standard/Express)
3. Review pricing and submit delivery requests with PayPal payment integration

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2.0 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7.3.1 |
| **Styling** | Tailwind CSS 4.2.1 |
| **State Management** | Zustand 5.0.11 |
| **Routing** | React Router DOM 7.13.1 |
| **HTTP Client** | Axios 1.13.5 |
| **Maps** | Google Maps API (@react-google-maps/api) |
| **Payments** | PayPal Checkout SDK |

### Architecture

```
src/
├── components/       # Reusable UI components
│   ├── WizardStep1.tsx    # Address input (geocoding)
│   ├── WizardStep2.tsx    # Weight & service selection
│   ├── WizardStep3.tsx    # Summary & payment
│   └── PayPalButton.tsx   # PayPal integration
├── services/         # API & external service clients
│   ├── api.ts             # Backend REST API client
│   └── googleMaps.ts      # Google Maps geocoding & routing
├── store/            # Zustand state management
│   └── calculatorStore.ts # Central form state
├── types/            # TypeScript type definitions
│   └── index.ts           # Shared interfaces
├── hooks/            # Custom React hooks
├── pages/            # Page components (empty)
└── styles/           # Global styles
```

## Building and Running

### Prerequisites

- Node.js (version compatible with the project)
- npm

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables in `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_API_URL=http://localhost:5000
   VITE_APP_ENV=development
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id  # Required for PayPal
   ```

### Development

```bash
npm run dev
```

Starts the Vite development server with hot module replacement (HMR).

### Production Build

```bash
npm run build
```

Compiles TypeScript and bundles the application for production.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

Runs ESLint on the codebase.

## Development Conventions

### Code Style

- **TypeScript**: Strict typing with interfaces defined in `src/types/index.ts`
- **Component Structure**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes with custom theme colors (`palmo-yellow`, `palmo-black`)
- **State Management**: Zustand store pattern for global form state

### Key Patterns

1. **Multi-step Wizard**: Three-step form with progress indicators managed by `currentStep` in Zustand store
2. **Geocoding on Blur**: Addresses are validated via backend geocoding endpoint when input fields lose focus
3. **Dynamic Pricing**: Cost calculation based on distance, weight tiers, service type, and additional services
4. **Payment Flow**: Submission created first, then PayPal payment processed via backend API

### Type Definitions

Core types in `src/types/index.ts`:
- `Coordinates` - Lat/lng pairs
- `DeliveryRequest` - Full form data structure
- `PricingConfig` - Base fee, per-km rate, weight multipliers
- `RouteInfo` - Distance, duration, cost from Google Maps

### API Integration

Backend API endpoints (configured via `VITE_API_URL`):
- `POST /api/submissions` - Create delivery request
- `POST /api/geocode` - Geocode address (CORS workaround)
- `POST /api/payments/create-order` - Create PayPal order
- `POST /api/payments/capture` - Capture PayPal payment

### UI Theme

Dark theme with yellow accents:
- Background: `#1A1A1A` (palmo-black)
- Cards: `#1F2937`
- Primary action: Yellow `#FFD700` (palmo-yellow)
- Text: White with gray variants for secondary text

## Project Structure Summary

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Wizard step components and PayPal button |
| `src/store/` | Zustand calculator state management |
| `src/services/` | External API clients (backend, Google Maps) |
| `src/types/` | TypeScript interfaces |
| `public/` | Static assets |
| `screenshots/` | UI screenshots for documentation |
| `agents/` | AI agent configurations |

## Important Notes

- PayPal SDK is loaded dynamically in `App.tsx`
- Google Maps Distance Matrix API used for route calculation
- Geocoding routed through backend to avoid CORS issues
- Form state persists across wizard steps via Zustand
- Pricing includes weight tiers and service multipliers

## Agent Files

The `agents/` directory contains autonomous debugging and testing agents:

| File | Purpose |
|------|---------|
| `palmo-frontend-debug-agent.md` | Auto-debugger agent with 8-phase execution (TypeScript, lint, dev server, build, tests, API integration, cross-repo analysis, auto-commit) |
| `palmo-frontend-master-prompt-v1.txt` | Comprehensive master prompt for Qwen3-Coder model with full debugging workflow |

### Agent Execution Phases

1. **Phase 0: Pre-flight** — Environment setup, clone, npm install
2. **Phase 1: Static Analysis** — TypeScript + ESLint checks
3. **Phase 2: Dev Server** — Start and verify Vite dev server
4. **Phase 3: Build Test** — Production build verification
5. **Phase 4: Unit Tests** — Run/create test suite
6. **Phase 5: API Integration** — Backend CORS and endpoint tests
7. **Phase 6: Cross-repo Analysis** — Frontend/backend type sync
8. **Phase 7: Auto-commit** — Atomic commits with push
9. **Phase 8: Report** — Generate JSON/Markdown results

### Related Repositories

- **Backend**: https://github.com/piotroq/palmo-trans-calculator-backend (port 5000)
- **WordPress**: Local instance on port 8088 (VITE_WP_API_URL)

### Brand Guidelines

- **Primary Color**: `#FFD700` (Gold/Yellow)
- **Background**: `#1A1A1A` (Dark)
- **Fonts**: Barlow Condensed, Inter
