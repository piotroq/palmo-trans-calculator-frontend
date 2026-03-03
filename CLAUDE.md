# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run test       # Vitest (unit tests, jsdom env)
npm run preview    # Preview production build
```

To run a single test file:
```bash
npx vitest run src/__tests__/SomeComponent.test.tsx
```

## Architecture Overview

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Zustand + Axios

### Two coexisting versions

The repo contains **v1 (production) and v2 (in development)** side by side:

| | v1 | v2 |
|---|---|---|
| Entry | `src/App.tsx` | `src/AppV2.tsx` |
| Store | `src/store/calculatorStore.ts` | `src/store/calculatorStoreV2.ts` |
| Steps | `src/components/WizardStep1/2/3.tsx` | `src/components/wizard/steps/` |
| API | `src/services/api.ts` | `src/services/apiV2.ts` |

`src/main.tsx` currently uses v1. To switch to v2, change the import to `AppV2`.

### v2 Wizard Architecture (active development)

6-step booking wizard modeled after Zipmend Express:

1. **Preis** — addresses + vehicle selection + additional services + date → live price quote
2. **Sendung** — package details (category, dimensions, weight, quantity) *(placeholder)*
3. **Abholung** — full pickup address form + time window selection *(placeholder)*
4. **Zustellung** — full delivery address form + time window selection *(placeholder)*
5. **Rechnungsadresse** — invoice data + VAT ID *(placeholder)*
6. **Zahlung** — payment method + order summary *(placeholder)*

**Data flow:**
- `WizardLayout` renders the step indicator and delegates to step components
- `StepPreis` (step 1) is fully implemented; steps 2-6 render `<PlaceholderStep>`
- All state lives in `useCalculatorStoreV2` — a single flat Zustand store (no slices despite what the expansion plan describes)
- Navigation is guarded: `canNavigateTo(step)` returns false unless prior steps are `completedSteps`

### Key files

- `src/types/calculator.ts` — all shared TypeScript types (Vehicle, Package, AddressData, PricingResult, etc.)
- `src/components/vehicles/vehicleData.ts` — static local copy of vehicle config (10 Express + 4 LKW); also served via `GET /api/v2/vehicles`
- `src/services/apiV2.ts` — Axios client pointing to `VITE_API_URL/api/v2`; distance fallback uses client-side Haversine × 1.3 multiplier when backend endpoint unavailable
- `src/components/wizard/WizardLayout.tsx` — step indicator bar with clickable navigation for completed steps

### Pricing formula

```
Total = basePrice + (distanceKm × pricePerKm) + Σ(selectedServices) + timeWindowSurcharge
```

Time window surcharges (Express only): 6h = 0 zł, 3h = +413.82 zł, Fixzeit = +831.82 zł. LKW has no time window surcharges.

VAT: 0% (Reverse Charge) for EU B2B customers with USt-ID; 19% otherwise.

### Backend API (separate repo)

- Base URL: `VITE_API_URL` (default `http://localhost:5000`)
- v1 endpoints: `/api/geocode`, `/api/calculate`, `/api/payment`, `/api/notify`
- v2 endpoints: `/api/v2/vehicles`, `/api/v2/services`, `/api/v2/time-windows`, `/api/v2/timeslots/:date`, `/api/v2/calculate`, `/api/v2/quick-quote`, `/api/v2/booking`

### Environment variables

- `VITE_API_URL` — backend base URL
- `VITE_PAYPAL_CLIENT_ID` — PayPal SDK client ID
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps (for address autocomplete)
