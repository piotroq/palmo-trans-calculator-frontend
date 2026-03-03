---
name: palmo-frontend-v2
description: "Agent do rozwijania frontendu PALMO-TRANS Calculator v2. React 19 + TypeScript + Vite + Tailwind + Zustand. 6-krokowy wizard: Preis → Sendung → Abholung → Zustellung → Rechnungsadresse → Zahlung."
color: blue
tools: Write, Read, MultiEdit, Bash, Grep, Glob
---

# PALMO-TRANS Frontend v2 — Development Agent

## Stack technologiczny

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7.x
- **State**: Zustand 5.x (`calculatorStoreV2.ts`)
- **Styling**: Tailwind CSS 4.x (utility-first, NO CSS modules)
- **HTTP**: Axios (`services/apiV2.ts`)
- **Router**: react-router-dom 7.x (opcjonalnie)

## Branding PALMO-TRANS

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

## Struktura komponentów

```
src/
├── AppV2.tsx                   ← Entry point
├── types/calculator.ts         ← Wszystkie typy TS
├── store/calculatorStoreV2.ts  ← Zustand store (6 slice'ów)
├── services/apiV2.ts           ← API client do backendu v2
├── components/
│   ├── wizard/
│   │   ├── WizardLayout.tsx    ← Layout + step indicator
│   │   └── steps/
│   │       ├── StepPreis.tsx       ← Krok 1 (GOTOWY)
│   │       ├── StepSendung.tsx     ← Krok 2 (TODO)
│   │       ├── StepAbholung.tsx    ← Krok 3 (TODO)
│   │       ├── StepZustellung.tsx  ← Krok 4 (TODO)
│   │       ├── StepRechnung.tsx    ← Krok 5 (TODO)
│   │       └── StepZahlung.tsx     ← Krok 6 (TODO)
│   ├── address/
│   │   └── AddressInput.tsx
│   ├── vehicles/
│   │   ├── vehicleData.ts
│   │   ├── VehicleCategoryToggle.tsx
│   │   ├── VehicleSelector.tsx
│   │   ├── VehicleCardExpanded.tsx
│   │   └── VehicleCardCompact.tsx
│   ├── services/
│   │   └── AdditionalServicesPanel.tsx
│   ├── scheduling/
│   │   ├── DateSelector.tsx
│   │   └── TimeWindowPreview.tsx
│   ├── payment/           ← TODO: Phase 6
│   ├── shipment/          ← TODO: Phase 3
│   └── ui/
│       ├── PriceSummary.tsx
│       └── StepNavigation.tsx
```

## Store (Zustand) — Kluczowe akcje

```typescript
// Nawigacja
setStep(step)          // Przejdź do kroku
goNext()               // Następny krok + markCompleted
goBack()               // Poprzedni krok
canNavigateTo(step)    // Czy można przejść

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

// Steps 3-4: Adresy
updatePickupAddress(data)
updatePickupSchedule(data)
updateDeliveryAddress(data)
updateDeliverySchedule(data)

// Step 5: Invoice
updateInvoice(data)
copyAddressToInvoice('pickup' | 'delivery')

// Step 6: Payment
setPaymentMethod('rechnung' | 'przelewy24' | 'paypal' | 'kreditkarte')
```

## API Endpoints (backend v2)

```
GET  /api/v2/vehicles(?category=express|lkw)
GET  /api/v2/services(?category=express|lkw)
GET  /api/v2/time-windows
GET  /api/v2/timeslots/:date
GET  /api/v2/shipment-categories
GET  /api/v2/payment-methods
POST /api/v2/quick-quote     ← {vehicleId, distanceKm, serviceIds?}
POST /api/v2/calculate       ← pełna kalkulacja
POST /api/v2/booking         ← złożenie zamówienia (TODO)
POST /api/geocode            ← geocoding adresu (legacy)
```

## Zasady kodowania

- TypeScript strict — żadnych `any`, `as any`
- Komponenty: functional + hooks only
- Style: Tailwind utility classes, NIE inline styles (wyjątek: brand colors)
- State: ZAWSZE przez Zustand store, NIE prop drilling
- API: ZAWSZE przez `services/apiV2.ts`, NIE bezpośredni fetch
- Walidacja: per-step przed `goNext()`, error messages w DE
- Responsywność: mobile-first, grid collapse na < md
- Animacje: transition-all duration-200 na interactive elements
- Komentarze: polski, nazwy zmiennych: angielski

## Workflow testowania

```bash
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Build test
npm run build

# Sprawdź w przeglądarce:
# 1. http://localhost:5173 — Step 1 się renderuje
# 2. DevTools → Console — brak błędów
# 3. DevTools → Network — API calls do localhost:5000
```
