# PALMO-TRANS Calculator Frontend

## Project Overview

A **React 19 + TypeScript + Vite** web application for PALMO-TRANS GmbH, providing an interactive delivery cost calculator with a multi-step wizard interface.

### Current Version: **v2 (6-Step Wizard)**

The application is being expanded from a 3-step wizard to a comprehensive 6-step wizard inspired by Zipmend Express:

1. **Preis** — Addresses, vehicle selection, additional services, date, price calculation
2. **Sendung** — Shipment category, dimensions, weight, quantity, stackable
3. **Abholung** — Pickup address details, time window
4. **Zustellung** — Delivery address details, time window
5. **Rechnungsadresse** — Invoice data, VAT ID
6. **Zahlung** — Summary + payment method selection

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2.0 |
| **Language** | TypeScript 5.9 (strict mode) |
| **Build Tool** | Vite 7.3.1 |
| **Styling** | Tailwind CSS 4.2.1 (utility-first) |
| **State Management** | Zustand 5.0.11 (sliced store) |
| **HTTP Client** | Axios 1.13.5 |
| **Testing** | Vitest 4.0.18, Playwright 1.58.2 |

### Architecture

```
src/
├── AppV2.tsx                     # Entry point for v2 wizard
├── types/
│   └── calculator.ts             # TypeScript types for 6-step wizard
├── store/
│   ├── calculatorStoreV2.ts      # Zustand store v2 (6 slices)
│   └── calculatorStore.ts        # Legacy store v1 (backup)
├── services/
│   ├── apiV2.ts                  # Backend REST API v2 client
│   ├── api.ts                    # Legacy API v1 client
│   └── googleMaps.ts             # Google Maps utilities
├── components/
│   ├── wizard/
│   │   ├── WizardLayout.tsx      # Main layout + step indicator
│   │   └── steps/
│   │       ├── StepPreis.tsx     # Step 1: Price calculation (DONE)
│   │       └── (Step2-6 TODO)    # Steps 2-6 (placeholders)
│   ├── address/
│   │   └── AddressInput.tsx      # Address input with geocoding
│   ├── vehicles/
│   │   ├── vehicleData.ts        # Vehicle configurations (frontend cache)
│   │   ├── VehicleCategoryToggle.tsx  # Express/LKW switch
│   │   ├── VehicleSelector.tsx   # Vehicle list with expand
│   │   ├── VehicleCardExpanded.tsx   # Expanded vehicle card
│   │   └── VehicleCardCompact.tsx    # Compact vehicle row
│   ├── services/
│   │   └── AdditionalServicesPanel.tsx  # Additional services checkboxes
│   ├── scheduling/
│   │   ├── DateSelector.tsx      # Date picker
│   │   └── TimeWindowPreview.tsx # Time window preview
│   ├── ui/
│   │   ├── PriceSummary.tsx      # Price summary display
│   │   └── StepNavigation.tsx    # Next/Back navigation
│   └── (legacy/)                 # Legacy v1 components (WizardStep1/2/3)
├── __tests__/                    # Unit tests (Vitest)
└── styles/                       # Global styles
```

## Building and Running

### Prerequisites

- Node.js (compatible version)
- npm

### Environment Setup

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_API_URL=http://localhost:5000
   VITE_APP_ENV=development
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

### Development

```bash
npm run dev
```

Starts Vite dev server on port 5173 with HMR.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Development Conventions

### Code Style

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks only
- **Styling**: Tailwind CSS utility classes (NO CSS modules)
- **State**: Always via Zustand store, NO prop drilling
- **API**: Always via `services/apiV2.ts`, NO direct fetch
- **Validation**: Per-step before navigation, error messages in German
- **Responsiveness**: Mobile-first, grid collapse on < md
- **Animations**: `transition-all duration-200` on interactive elements
- **Comments**: Polish language, variable names: English

### Store Pattern (Zustand v2)

The v2 store uses a sliced architecture with dedicated actions per step:

```typescript
// Navigation
setStep(step)          // Go to step
goNext()               // Next step + mark completed
goBack()               // Previous step
canNavigateTo(step)    // Check if navigation allowed

// Step 1: Preis
setVehicleCategory('express' | 'lkw')
setVehicle('EXP-01')
toggleService('SVC-01')
setPickupAddress(addr, coords?)
setDeliveryAddress(addr, coords?)

// Step 2: Sendung
addPackage(pkg)
updatePackage(id, data)
removePackage(id)

// Steps 3-4: Addresses
updatePickupAddress(data)
updatePickupSchedule(data)

// Step 5: Invoice
updateInvoice(data)
copyAddressToInvoice('pickup' | 'delivery')

// Step 6: Payment
setPaymentMethod('rechnung' | 'przelewy24' | 'paypal' | 'kreditkarte')
```

### API Endpoints (Backend v2)

```
GET  /api/v2/vehicles(?category=express|lkw)
GET  /api/v2/services(?category=express|lkw)
GET  /api/v2/time-windows
GET  /api/v2/timeslots/:date
GET  /api/v2/shipment-categories
GET  /api/v2/payment-methods
POST /api/v2/quick-quote     — {vehicleId, distanceKm, serviceIds?}
POST /api/v2/calculate       — Full price calculation
POST /api/v2/booking         — Create booking
POST /api/geocode            — Geocoding (legacy endpoint)
```

### Branding (PALMO-TRANS)

```
Primary Yellow:  #FFD700  → Tailwind: yellow-400
Background:      #1A1A1A  → inline style
Card BG:         bg-gray-800/50, bg-gray-900/50
Text:            white, gray-300, gray-400, gray-500
Active border:   border-yellow-400
Error:           red-400, red-500
Success:         green-400, green-500
Font:            Barlow Condensed (headings), Inter (body)
```

### Vehicle Configuration

**Express Vehicles (10 options):**
| ID | Name | Max Weight | Base Price | Price/km |
|----|------|------------|------------|----------|
| EXP-01 | Kleiner Transporter | 400kg | 250 zł | 3.50 zł |
| EXP-02 | Mittlerer Transporter | 800kg | 300 zł | 3.75 zł |
| EXP-03 | Großer Transporter | 1200kg | 400 zł | 4.50 zł |
| EXP-04 | Hebebühne und Hubwagen | 800kg | 450 zł | 4.75 zł |
| EXP-05-10 | Specialized vehicles | 1200kg | 500-700 zł | 5.15-6.75 zł |

**LKW Vehicles (4 options):**
| ID | Name | Max Weight | Pallets | Base Price | Price/km |
|----|------|------------|---------|------------|----------|
| LKW-01 | 3t Sendung | 3000kg | 14 | 450 zł | 5.25 zł |
| LKW-02 | 5t Sendung | 5000kg | 14 | 520 zł | 6.05 zł |
| LKW-03 | 12t Sendung | 12000kg | 18 | 620 zł | 7.35 zł |
| LKW-04 | 24t Sendung | 24000kg | 33 | 750 zł | 8.70 zł |

### Additional Services (Zusatzservices)

| ID | Service | Price | Availability |
|----|---------|-------|--------------|
| SVC-01 | Beladehilfe durch Fahrer | +119 zł | Express |
| SVC-02 | Entladehilfe durch Fahrer | +119 zł | Express |
| SVC-03 | Neutrale Abholung/Zustellung | +499 zł | Express + LKW |
| SVC-04 | Papierrechnung | +49.99 zł | Express + LKW |
| SVC-05 | Beladung von oben | +399 zł | LKW |
| SVC-06 | Hebebühne | +619 zł | LKW |

### Time Window Surcharges

| Window | Express | LKW |
|--------|---------|-----|
| 6 Stunden | Free | Free |
| 3 Stunden | +413.82 zł | Free |
| Fixzeit | +831.82 zł | Free |

## Testing

### Unit Tests

```bash
npm run test
```

Test files located in `src/__tests__/`:
- `store.test.ts` — Zustand store actions
- `api.test.ts` — API configuration validation

### Development Workflow

```bash
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Build test
npm run build

# Check in browser:
# 1. http://localhost:5173 — Step 1 renders
# 2. DevTools → Console — no errors
# 3. DevTools → Network — API calls to localhost:5000
```

## Project Structure Summary

| Directory | Purpose |
|-----------|---------|
| `src/components/wizard/` | 6-step wizard layout and steps |
| `src/components/vehicles/` | Vehicle selection components |
| `src/components/address/` | Address input with geocoding |
| `src/components/services/` | Additional services panel |
| `src/components/scheduling/` | Date and time window selection |
| `src/components/ui/` | Reusable UI components |
| `src/store/` | Zustand state management |
| `src/services/` | API clients |
| `src/types/` | TypeScript type definitions |
| `src/__tests__/` | Unit tests |
| `agents/` | AI agent configurations |
| `.claude/agents/` | Claude-specific agent files |

## Important Notes

- **Entry Point**: `main.tsx` imports `AppV2.tsx` for v2 wizard
- **Legacy**: Original 3-step wizard preserved in `App.tsx` and `components/legacy/`
- **Geocoding**: Routed through backend to avoid CORS issues
- **Pricing**: Dynamic calculation based on distance, vehicle, services, time windows
- **Type Safety**: Strict TypeScript, no `any` types allowed
- **Language**: UI labels in German, code comments in Polish

## Agent Files

### `/agents/` Directory
| File | Purpose |
|------|---------|
| `palmo-frontend-debug-agent.md` | Auto-debugger with 8-phase execution |
| `palmo-frontend-master-prompt-v1.txt` | Master prompt for debugging workflow |
| `palmo-frontend-v2.md` | V2 development agent configuration |
| `PROMPT-PHASE2-INTEGRATION.md` | Phase 2 integration instructions |

### `/.claude/agents/` Directory
| File | Purpose |
|------|---------|
| `palmo-frontend-v2.md` | Claude agent for v2 frontend development |
| `PROMPT-PHASE2-INTEGRATION.md` | Step 1 integration workflow |

## Related Repositories

- **Backend v2**: https://github.com/piotroq/palmo-trans-calculator-backend (port 5000)
- **WordPress**: Local instance on port 8088

## Development Status

### ✅ Completed (Phase 1 & V2 Foundation)

- **3-step wizard v1** (Address → Details → Payment)
- **6-step wizard v2 layout** with step indicator
- **Step 1: Preis** fully implemented:
  - Address inputs with country selector and geocoding
  - Express/LKW vehicle category toggle
  - Vehicle selector with expandable cards (10 Express + 4 LKW)
  - Additional services panel
  - Date selector
  - Time window preview
  - Dynamic price calculation
  - Step navigation

- **TypeScript types** for all 6 steps
- **Zustand store v2** with sliced architecture
- **API v2 client** with all endpoints
- **Unit tests** (8 passing)
- **Zero TypeScript errors**
- **Zero ESLint errors**

### 🔄 In Progress (Phase 2)

- Step 2: Sendung (shipment form)
- Step 3: Abholung (pickup details)
- Step 4: Zustellung (delivery details)
- Step 5: Rechnungsadresse (invoice data)
- Step 6: Zahlung (payment + booking submission)

### 📋 Planned

- Backend integration for real-time pricing
- Booking submission API
- Payment method integration (PayPal, Przelewy24, Kreditkarte)
- WordPress admin panel for booking management
- E2E tests with Playwright

## Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/piotroq/palmo-trans-calculator-frontend.git
cd palmo-trans-calculator-frontend
cp .env.example .env
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Lint codebase
npm run lint

# TypeScript check
npx tsc --noEmit
```

## Debugging Resources

- **Debug Report**: `debug-report.md` — Latest debugging session results
- **Test Results**: `test-results.json` — Automated test execution logs
- **Start Command**: `KOMENDA-STARTOWA-FRONTEND` — Quick start script
- **Expansion Plan**: `PALMO-TRANS-Calculator-Expansion-Plan.md` — Full v2 roadmap

## Price Calculation Formula

```
Final Price = Vehicle Base Price
            + (Distance km × Price per km)
            + Sum of Additional Services
            + Pickup Time Window Surcharge
            + Delivery Time Window Surcharge
            + Payment Method Fee
            + VAT (0% for B2B reverse charge)
```
