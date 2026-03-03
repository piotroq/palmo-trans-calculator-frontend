# PALMO-TRANS Calculator — Phase 2: Integracja Step 1 (Preis)

## Kontekst

Mam gotowe 17 nowych plików React/TypeScript dla 6-krokowego wizarda kalkulatora.
Pliki zostały rozpakowane z archiwum `palmo-phase2-step1-preis.tar.gz` do katalogu `frontend/`.

## Twoje zadania (wykonaj po kolei):

### 1. Skopiuj nowe pliki do repo

Skopiuj strukturę z `frontend/src/` do odpowiednich lokalizacji w projekcie 
`palmo-trans-calculator-frontend/src/`:

```
src/
├── AppV2.tsx                              ← Nowy entry point (zmień import w main.tsx)
├── types/
│   └── calculator.ts                      ← NOWY: typy dla 6-krokowego wizarda
├── store/
│   └── calculatorStoreV2.ts               ← NOWY: Zustand store v2 (6 kroków)
├── services/
│   └── apiV2.ts                           ← NOWY: API client v2
├── components/
│   ├── wizard/
│   │   ├── WizardLayout.tsx               ← NOWY: Layout wizarda
│   │   └── steps/
│   │       └── StepPreis.tsx              ← NOWY: Krok 1 container
│   ├── address/
│   │   └── AddressInput.tsx               ← NOWY: Pole adresu + geocoding
│   ├── vehicles/
│   │   ├── vehicleData.ts                 ← NOWY: Dane pojazdów (frontend)
│   │   ├── VehicleCategoryToggle.tsx      ← NOWY: Express/LKW toggle
│   │   ├── VehicleSelector.tsx            ← NOWY: Lista pojazdów z expand
│   │   ├── VehicleCardExpanded.tsx        ← NOWY: Rozwinięta karta pojazdu
│   │   └── VehicleCardCompact.tsx         ← NOWY: Kompaktowy wiersz pojazdu
│   ├── services/
│   │   └── AdditionalServicesPanel.tsx    ← NOWY: Checkboxy usług
│   ├── scheduling/
│   │   ├── DateSelector.tsx               ← NOWY: Wybór daty
│   │   └── TimeWindowPreview.tsx          ← NOWY: Podgląd okien czasowych
│   ├── ui/
│   │   ├── PriceSummary.tsx               ← NOWY: Podsumowanie ceny
│   │   └── StepNavigation.tsx             ← NOWY: Przyciski Next/Back
│   └── (zachowaj stare pliki WizardStep1/2/3 w legacy/)
```

### 2. Zaktualizuj main.tsx

Zmień import z `App` na `AppV2`:

```tsx
// src/main.tsx
import App from './AppV2'  // ← zmień z './App'
```

**WAŻNE**: Nie usuwaj starego `App.tsx` — zachowaj go jako fallback.

### 3. Sprawdź VITE_API_URL

Upewnij się, że w `.env` (lub `.env.local`) jest:
```
VITE_API_URL=http://localhost:5000
```

### 4. Uruchom dev server i napraw błędy

```bash
npm run dev
```

Prawdopodobne problemy do naprawienia:
- **Import paths**: Sprawdź czy ścieżki relatywne (`../../store/calculatorStoreV2`) są poprawne
- **Tailwind classes**: Upewnij się, że `tailwind.config` skanuje `src/components/**/*.tsx`
- **Missing exports**: Jeśli TS narzeka na brak eksportów, dodaj potrzebne barrel files
- **VITE_API_URL**: Jeśli brak, API calls do `/api/v2/*` nie zadziałają

### 5. Sprawdź wizualnie w przeglądarce

Otwórz `http://localhost:5173` i sprawdź:

1. ✅ Step indicator z 6 krokami (1. Preis jest aktywny, żółty)
2. ✅ Sekcja adresów (Abholung / Zustellung) z country selector
3. ✅ Toggle Express / LKW 
4. ✅ Lista pojazdów (Express: 4 widoczne + "Weitere Fahrzeug-Typen")
5. ✅ Po kliknięciu pojazdu — rozwija się karta ze szczegółami
6. ✅ Zusatzservices checkboxy po prawej stronie
7. ✅ Ladedatum wählen (4 dni + Datum wählen)
8. ✅ Früheste Abholung/Zustellung preview
9. ✅ Gesamtsumme na dole
10. ✅ Przycisk "Weiter zur Sendung" (żółty CTA)

### 6. Napraw layout responsywny

Na mobile sprawdź:
- Vehicles + Services powinny być w jednej kolumnie (stack)
- Date pills powinny się zawijać
- Step labels powinny być ukryte (tylko progress bar widoczny)

### 7. Test integracji z backendem

Upewnij się, że backend v2 działa (`npm run dev` w drugim terminalu):

```bash
# W przeglądarce DevTools → Network:
# Po wpisaniu adresów i wybraniu pojazdu, sprawdź czy jest request do:
# POST http://localhost:5000/api/v2/quick-quote
# z body: {"vehicleId":"EXP-01","distanceKm":48}
```

Jeśli CORS blokuje, sprawdź w `server.ts` czy `FRONTEND_URL` odpowiada `http://localhost:5173`.

### 8. Raportuj wynik

Po ukończeniu raportuj:
- Które pliki wymagały poprawek i jakich
- Screenshot lub opis jak wygląda Step 1
- Czy API integration działa (ceny się przeliczają)
- Jakieś TypeScript lub runtime errory

## Branding PALMO-TRANS

Przypomnienie kolorów:
- Primary: `#FFD700` (yellow-400 w Tailwind) 
- Background: `#1A1A1A` 
- Cards: `bg-gray-800/50`, `bg-gray-900/50`
- Text: white, gray-300, gray-400, gray-500
- Borders: gray-700, yellow-400 (active)
- Error: red-400/500
- Success: green-400/500
