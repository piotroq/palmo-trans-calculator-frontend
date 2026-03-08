# PALMO-TRANS Calculator — Qwen AI Project Instructions

## 📋 Overview

**Project:** PALMO-TRANS GmbH Delivery Cost Calculator (v2 Expansion)  
**Goal:** Expand from 3-step to 6-step wizard (Zipmend Express-style)  
**Repositories:**

- Backend: https://github.com/piotroq/palmo-trans-calculator-backend
- Frontend: https://github.com/piotroq/palmo-trans-calculator-frontend

---

## 🏗️ Architecture

### Frontend Stack

| Technology   | Version | Purpose                             |
| ------------ | ------- | ----------------------------------- |
| React        | 19.2.0  | UI Framework                        |
| TypeScript   | 5.9+    | Type Safety (strict mode, no `any`) |
| Vite         | 7.3.1   | Build Tool                          |
| Tailwind CSS | 4.2.1   | Styling (utility-first)             |
| Zustand      | 5.0.11  | State Management (sliced store)     |
| Axios        | 1.13.5  | HTTP Client                         |
| Vitest       | 4.0.18  | Unit Tests                          |
| Playwright   | 1.58.2  | E2E Tests                           |

### Backend Stack

| Technology | Version    | Purpose                    |
| ---------- | ---------- | -------------------------- |
| Node.js    | Latest LTS | Runtime                    |
| Express    | 5.x        | Web Framework              |
| TypeScript | 5.9+       | Strict mode, ES2020 target |
| PostgreSQL | 15+        | Database (recommended)     |
| Nodemailer | Latest     | Email Service              |
| PayPal SDK | Latest     | Payment Integration        |
| Zod        | Latest     | Validation                 |

---

## 📁 Project Structure

### Frontend

```
palmo-trans-calculator-frontend/
├── src/
│   ├── AppV2.tsx                     # 6-step wizard entry point
│   ├── types/
│   │   └── calculator.ts             # TypeScript types for all 6 steps
│   ├── store/
│   │   ├── calculatorStoreV2.ts      # Zustand store (6 slices)
│   │   └── slices/                   # address, vehicle, shipment, schedule, services, invoice, pricing
│   ├── services/
│   │   ├── apiV2.ts                  # Backend REST API v2 client
│   │   └── googleMaps.ts             # Geocoding utilities
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardLayout.tsx      # Main layout + step indicator
│   │   │   ├── WizardSidebar.tsx     # Order summary (Übersicht)
│   │   │   └── steps/
│   │   │       ├── Step1Preis.tsx    # Addresses + vehicle + services + date
│   │   │       ├── Step2Sendung.tsx  # Shipment category, dimensions, weight
│   │   │       ├── Step3Abholung.tsx # Pickup details + time window
│   │   │       ├── Step4Zustellung.tsx # Delivery details + time window
│   │   │       ├── Step5Rechnung.tsx # Invoice data + VAT ID
│   │   │       └── Step6Zahlung.tsx  # Summary + payment method
│   │   ├── vehicles/
│   │   ├── services/
│   │   ├── address/
│   │   ├── scheduling/
│   │   └── ui/
│   ├── __tests__/                    # Unit tests
│   └── config/                       # Static configs (vehicles, services)
├── .env
├── package.json
└── tsconfig.json
```

### Backend

```
palmo-trans-calculator-backend/
├── src/
│   ├── server.ts                     # Main entry point
│   ├── config/
│   │   ├── vehicles.ts               # Vehicle configurations
│   │   ├── pricing.ts                # Pricing rules
│   │   └── services.ts               # Additional services
│   ├── controllers/
│   ├── services/
│   │   ├── pricingEngine.ts          # Price calculation logic
│   │   ├── emailService.ts           # Nodemailer
│   │   ├── paypalService.ts          # PayPal API
│   │   └── bookingService.ts         # Booking management
│   ├── routes/
│   ├── middleware/
│   │   ├── validation.ts             # Zod schemas
│   │   └── errorHandler.ts           # Global error handler
│   ├── types/
│   └── utils/
├── uploads/
├── .env.local
├── package.json
└── tsconfig.json
```

---

## 🚀 6-Step Wizard Flow

| Step | Name                 | Purpose                                   | Key Components                                                |
| ---- | -------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| 1    | **Preis**            | Addresses, vehicle, services, date, price | AddressInput, VehicleSelector, AdditionalServices, DatePicker |
| 2    | **Sendung**          | Shipment details                          | CategorySelector, PackageForm, PackageList                    |
| 3    | **Abholung**         | Pickup address + time window              | AddressForm, TimeWindowSelector                               |
| 4    | **Zustellung**       | Delivery address + time window            | AddressForm, TimeWindowSelector                               |
| 5    | **Rechnungsadresse** | Invoice data + VAT ID                     | InvoiceForm, VATValidator                                     |
| 6    | **Zahlung**          | Summary + payment                         | PaymentMethodSelector, OrderSummary, Sidebar                  |

---

## 💰 Pricing Engine

### Formula

```
Final Price = Vehicle Base Price
            + (Distance km × Price per km)
            + Sum of Additional Services
            + Pickup Time Window Surcharge
            + Delivery Time Window Surcharge
            + Payment Method Fee
            + VAT (0% for B2B reverse charge, 19% for B2C)
```

### Express Vehicles (max 1200kg)

| ID     | Name                   | Max Weight | Base Price (zł) | Price/km (zł) |
| ------ | ---------------------- | ---------- | --------------- | ------------- |
| EXP-01 | Kleiner Transporter    | 400kg      | 250,00          | 3,50          |
| EXP-02 | Mittlerer Transporter  | 800kg      | 300,00          | 3,75          |
| EXP-03 | Großer Transporter     | 1200kg     | 400,00          | 4,50          |
| EXP-04 | Hebebühne und Hubwagen | 800kg      | 450,00          | 4,75          |
| EXP-05 | Länge 450cm            | 1200kg     | 500,00          | 5,15          |
| EXP-06 | Länge 480cm            | 1200kg     | 550,00          | 5,45          |
| EXP-07 | Breite 230cm           | 1200kg     | 530,00          | 5,35          |
| EXP-08 | Höhe 240cm             | 1200kg     | 480,00          | 4,70          |
| EXP-09 | Beladung von oben      | 1200kg     | 650,00          | 6,60          |
| EXP-10 | Gefahrgut              | 1200kg     | 700,00          | 6,75          |

### LKW Vehicles

| ID     | Name        | Pallets | Max Weight | Base Price (zł) | Price/km (zł) |
| ------ | ----------- | ------- | ---------- | --------------- | ------------- |
| LKW-01 | 3t Sendung  | 14      | 3000kg     | 450,00          | 5,25          |
| LKW-02 | 5t Sendung  | 14      | 5000kg     | 520,00          | 6,05          |
| LKW-03 | 12t Sendung | 18      | 12000kg    | 620,00          | 7,35          |
| LKW-04 | 24t Sendung | 33      | 24000kg    | 750,00          | 8,70          |

### Additional Services (Zusatzservices)

| ID     | Service                      | Price (zł) | Availability  |
| ------ | ---------------------------- | ---------- | ------------- |
| SVC-01 | Beladehilfe durch Fahrer     | 119,00     | Express       |
| SVC-02 | Entladehilfe durch Fahrer    | 119,00     | Express       |
| SVC-03 | Neutrale Abholung/Zustellung | 499,00     | Express + LKW |
| SVC-04 | Papierrechnung               | 49,99      | Express + LKW |
| SVC-05 | Beladung von oben            | 399,00     | LKW           |
| SVC-06 | Hebebühne                    | 619,00     | LKW           |

### Time Window Surcharges

| Window    | Express    | LKW  |
| --------- | ---------- | ---- |
| 6 Stunden | Free       | Free |
| 3 Stunden | +413,82 zł | Free |
| Fixzeit   | +831,82 zł | Free |

---

## 🔌 API Endpoints

### Backend v2

| Method | Endpoint                      | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| GET    | `/api/v2/vehicles`            | Get all vehicles (filter by category) |
| GET    | `/api/v2/services`            | Get additional services               |
| GET    | `/api/v2/time-windows`        | Get time window options               |
| GET    | `/api/v2/timeslots/:date`     | Get available time slots for date     |
| GET    | `/api/v2/shipment-categories` | Get shipment categories               |
| GET    | `/api/v2/payment-methods`     | Get payment methods                   |
| POST   | `/api/v2/quick-quote`         | Quick price estimate                  |
| POST   | `/api/v2/calculate`           | Full price calculation                |
| POST   | `/api/v2/booking`             | Create booking                        |
| POST   | `/api/geocode`                | Geocode address (legacy)              |
| GET    | `/health`                     | Health check                          |

### Submissions (Legacy)

| Method | Endpoint                            | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/submissions`                  | Get all submissions    |
| POST   | `/api/submissions`                  | Create submission      |
| GET    | `/api/submissions/:referenceNumber` | Get by reference       |
| GET    | `/api/submissions/email/:email`     | Get by email (last 10) |
| PATCH  | `/api/submissions/:id/status`       | Update status          |

### Payments

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | `/api/payments/create-order` | Create PayPal order |
| POST   | `/api/payments/capture`      | Capture payment     |

---

## 🗄️ Database Schema (PostgreSQL)

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',

  -- Pricing
  vehicle_id VARCHAR(20) NOT NULL,
  vehicle_category VARCHAR(10) NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL,
  vehicle_base_price DECIMAL(10,2) NOT NULL,
  distance_charge DECIMAL(10,2) NOT NULL,
  services_total DECIMAL(10,2) NOT NULL,
  time_window_surcharge DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,4) DEFAULT 0,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Shipment (JSONB)
  packages JSONB NOT NULL,
  additional_info TEXT,
  selected_services TEXT[],

  -- Pickup
  pickup_company VARCHAR(255),
  pickup_first_name VARCHAR(100) NOT NULL,
  pickup_last_name VARCHAR(100) NOT NULL,
  pickup_street VARCHAR(255) NOT NULL,
  pickup_postal_code VARCHAR(20) NOT NULL,
  pickup_city VARCHAR(100) NOT NULL,
  pickup_country VARCHAR(5) DEFAULT 'DE',
  pickup_phone VARCHAR(30) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time_window VARCHAR(20),

  -- Delivery
  delivery_company VARCHAR(255),
  delivery_first_name VARCHAR(100) NOT NULL,
  delivery_last_name VARCHAR(100) NOT NULL,
  delivery_street VARCHAR(255) NOT NULL,
  delivery_postal_code VARCHAR(20) NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_country VARCHAR(5) DEFAULT 'DE',
  delivery_phone VARCHAR(30) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time_window VARCHAR(20),

  -- Invoice
  invoice_email VARCHAR(255) NOT NULL,
  invoice_company VARCHAR(255),
  invoice_first_name VARCHAR(100) NOT NULL,
  invoice_last_name VARCHAR(100) NOT NULL,
  invoice_vat_id VARCHAR(30),

  -- Payment
  payment_method VARCHAR(30),
  payment_status VARCHAR(20) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Coordinates
  pickup_lat DECIMAL(10,7),
  pickup_lng DECIMAL(10,7),
  delivery_lat DECIMAL(10,7),
  delivery_lng DECIMAL(10,7)
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_number ON bookings(booking_number);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);
```

---

## 🎨 Branding (PALMO-TRANS)

| Element        | Value            | Tailwind Class                     |
| -------------- | ---------------- | ---------------------------------- |
| Primary Yellow | `#FFD700`        | `yellow-400`                       |
| Background     | `#1A1A1A`        | inline style                       |
| Card BG        | -                | `bg-gray-800/50`, `bg-gray-900/50` |
| Text           | -                | `white`, `gray-300`, `gray-400`    |
| Active Border  | -                | `border-yellow-400`                |
| Error          | -                | `red-400`, `red-500`               |
| Success        | -                | `green-400`, `green-500`           |
| Font Headings  | Barlow Condensed | -                                  |
| Font Body      | Inter            | -                                  |

---

## 📝 Development Conventions

### TypeScript

- Strict mode enabled
- **NO `any` types** — use proper interfaces
- ES2020+ target
- CommonJS modules (backend) / ESM (frontend)

### Code Style

- Functional components with hooks only (React)
- Tailwind CSS utility classes (NO CSS modules)
- State via Zustand store (NO prop drilling)
- API calls via `services/apiV2.ts` (NO direct fetch)
- Early returns and guard clauses for error handling
- DRY principle — modularize over duplicate

### Language

- **UI Labels:** German (DE)
- **Code Comments:** Polish (PL)
- **Variable Names:** English (EN)

### Validation

- Per-step validation before navigation
- Error messages in German
- Zod schemas for backend validation

### Responsiveness

- Mobile-first approach
- Grid collapse on `< md` breakpoint
- `transition-all duration-200` on interactive elements

---

## 🔧 Environment Variables

### Frontend (.env)

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Backend (.env.local)

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=PALMO-TRANS <your_email@gmail.com>

# PayPal (Sandbox)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/palmo_trans

# Logging
LOG_LEVEL=debug
```

---

## 🚦 Implementation Phases

### Phase 1: Foundation (3-4 days)

**Backend:**

- [ ] Extend vehicle configuration (`config/vehicles.ts`)
- [ ] Implement Pricing Engine with full rates
- [ ] Add endpoint `POST /api/v2/calculate`
- [ ] Add endpoint `GET /api/v2/timeslots/:date`
- [ ] Add input validation (Zod schemas)
- [ ] Setup PostgreSQL + `bookings` schema

**Frontend:**

- [ ] Create `WizardLayout.tsx` with 6 steps
- [ ] Implement `WizardStepIndicator.tsx`
- [ ] Extend Zustand store with new slices
- [ ] Define TypeScript types for all entities

### Phase 2: Step 1 — Preis (2-3 days)

- [ ] `Step1Preis.tsx` — Address inputs (Abholung/Zustellung)
- [ ] `VehicleTypeToggle.tsx` — Express / LKW switch
- [ ] `VehicleSelector.tsx` — Vehicle list with prices
- [ ] `AdditionalServices.tsx` — Zusatzservices checkboxes
- [ ] `DatePicker.tsx` — Date selection
- [ ] Dynamic price calculation on change

### Phase 3: Step 2 — Sendung (1-2 days)

- [ ] `ShipmentForm.tsx` — Package form
- [ ] `CategorySelector.tsx` — Palette, Dokument, Paket, etc.
- [ ] Dynamic fields: Anzahl, Stapelbar, Gewicht, L×W×H
- [ ] "+ Weitere Sendung" — Multiple packages
- [ ] Dimension validation vs selected vehicle

### Phase 4: Steps 3-4 — Abholung + Zustellung (2 days)

- [ ] `AddressForm.tsx` — Reusable form component
- [ ] `TimeWindowSelector.tsx` — 6h / 3h / Fixzeit
- [ ] `TimeSlotPicker.tsx` — Time slots (08:00-14:00, etc.)
- [ ] Dynamic price update on time window change

### Phase 5: Step 5 — Rechnungsadresse (1 day)

- [ ] Invoice form with all fields
- [ ] "Copy from Pickup/Delivery" option
- [ ] VAT ID validation (country-specific format)

### Phase 6: Step 6 — Zahlung + Sidebar (2 days)

- [ ] `PaymentMethodSelector.tsx` — Rechnung, P24, PayPal, Karte
- [ ] Full order summary
- [ ] `WizardSidebar.tsx` — Übersicht with all step data
- [ ] "Bearbeiten" buttons in sidebar
- [ ] PayPal Checkout integration
- [ ] Przelewy24 integration (optional)

### Phase 7: Polish + Deploy (2-3 days)

- [ ] Mobile responsiveness
- [ ] Animations and transitions between steps
- [ ] Error handling and user feedback
- [ ] Email notifications (order confirmation)
- [ ] WordPress admin plugin — booking list
- [ ] E2E tests with Playwright
- [ ] Deploy to app.palmo-trans.com

---

## 🧪 Testing

### Frontend

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# TypeScript check
npx tsc --noEmit

# Build test
npm run build

# Lint
npm run lint
```

### Backend

```bash
# Dev mode
npm run dev

# Build
npm run build

# Health check
curl http://localhost:5000/health

# Test submission
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"pickupAddress":"Berlin","deliveryAddress":"Warsaw","weight":15,"serviceType":"standard","contactEmail":"test@test.com"}'
```

---

## ⚠️ Common Issues Checklist

| Problem              | Check                                                   |
| -------------------- | ------------------------------------------------------- |
| CORS errors          | Verify `cors()` middleware before routes in `server.ts` |
| 404 on routes        | Check route registration in `server.ts`                 |
| Data lost on restart | Mock DB uses in-memory Map (needs PostgreSQL)           |
| Email not sending    | Verify SMTP config in `.env.local`                      |
| PayPal errors        | Check `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`     |
| TypeScript errors    | Run `npx tsc --noEmit`                                  |
| Geocoding fails      | Check `GOOGLE_MAPS_API_KEY`                             |

---

## 📦 Quick Start Commands

```bash
# Clone repositories
git clone https://github.com/piotroq/palmo-trans-calculator-backend.git
git clone https://github.com/piotroq/palmo-trans-calculator-frontend.git

# Backend setup
cd palmo-trans-calculator-backend
git checkout -b feature/calculator-v2
npm install
npm install zod pg @types/pg
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev

# Frontend setup (in new terminal)
cd ../palmo-trans-calculator-frontend
git checkout -b feature/calculator-v2
npm install
npm install react-datepicker @types/react-datepicker
npm install -D @tailwindcss/forms
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

---

## 🎯 Key Business Rules

1. **Reference Number Format:** `PTR-{timestamp}-{uuid}`
2. **Email Notifications:** Send to office (`biuro@palmo-trans.com`) AND customer
3. **VAT Handling:** 0% for B2B reverse charge (EU customers), 19% for B2C
4. **In-Memory Storage:** Current mock DB — must migrate to PostgreSQL for production
5. **Geocoding:** Routed through backend to avoid CORS issues
6. **Language:** UI in German, code comments in Polish, variables in English
7. **Payment Methods:** PayPal (required), Rechnung, Przelewy24, Kreditkarte (optional)
8. **Time Windows:** 6h (free), 3h (+413,82 zł Express), Fixzeit (+831,82 zł Express)

---

## 📎 Related Projects

| Project         | URL/Path                                                    | Purpose                       |
| --------------- | ----------------------------------------------------------- | ----------------------------- |
| Frontend v2     | `~/Documents/GitHub/strony/palmo-trans-calculator-frontend` | 6-step wizard                 |
| Backend v2      | `~/Documents/GitHub/strony/palmo-trans-calculator-backend`  | API server                    |
| WordPress       | `~/Documents/GitHub/strony/palmo-trans-de-website`          | Company website + sync plugin |
| WordPress Admin | Local port 8088                                             | Booking management panel      |

---

## 🤝 Contact / Stakeholders

- **Developer:** PIOTROQ (Senior Fullstack, 12+ years)
- **Company:** PALMO-TRANS GmbH
- **Pricing Approval:** Monika Mroczkowska (management)
- **Office Email:** biuro@palmo-trans.com

---

## 📌 Notes for Qwen AI

1. **Always provide production-ready code** — no theoretical examples
2. **Use latest stable syntax** — ES2024+, TypeScript 5.9+, Node.js LTS
3. **Type-safe code** — avoid `any`, use proper interfaces
4. **Error handling** — early returns, guard clauses, custom `ApiError` class
5. **DRY principle** — modularize over duplication
6. **Step-by-step instructions** — detailed implementation guides
7. **Polish comments** — code comments in Polish language
8. **German UI** — all user-facing text in German
9. **Test before commit** — ensure zero TypeScript/ESLint errors
10. **Reference this document** — for all project-specific decisions

---

**Document Version:** 1.0  
**Last Updated:** March 08, 2026  
**Author:** PIOTROQ + Qwen AI
