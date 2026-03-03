# PALMO-TRANS Calculator — Phase 5+6: Steps 5-6 (Rechnungsadresse + Zahlung) — FINAŁ

## Pliki (4 pliki)

Z archiwum `palmo-phase5-6-final-steps.tar.gz`:

| Plik | Lokalizacja | Status |
|------|------------|--------|
| `WizardLayout.tsx` | `src/components/wizard/` | **NADPISZ** |
| `WizardSidebar.tsx` | `src/components/wizard/` | **NADPISZ** |
| `StepRechnung.tsx` | `src/components/wizard/steps/` | **NOWY** |
| `StepZahlung.tsx` | `src/components/wizard/steps/` | **NOWY** |

## ⚠️ Store i Types — wymagane pola dla Steps 5-6

### Krok A: `src/types/calculator.ts` — dodaj jeśli brak:

```typescript
export interface InvoiceData {
  email: string;
  company: string;
  salutation: 'Herr' | 'Frau' | '';
  firstName: string;
  lastName: string;
  street: string;
  addressExtra: string;
  country: string;
  postalCode: string;
  city: string;
  phone: string;
  reference: string;
  vatId: string;
  billingEmail: string;
}

export type PaymentMethod = 'rechnung' | 'przelewy24' | 'paypal' | 'kreditkarte';
```

### Krok B: `src/store/calculatorStoreV2.ts` — dodaj jeśli brak:

**State:**
```typescript
invoice: InvoiceData;
paymentMethod: PaymentMethod | null;
```

**Initial state:**
```typescript
invoice: {
  email: '', company: '', salutation: '', firstName: '', lastName: '',
  street: '', addressExtra: '', country: 'PL', postalCode: '', city: '',
  phone: '', reference: '', vatId: '', billingEmail: '',
},
paymentMethod: null,
```

**Actions:**
```typescript
updateInvoice: (data: Partial<InvoiceData>) =>
  set((s) => ({ invoice: { ...s.invoice, ...data } })),

setPaymentMethod: (method: PaymentMethod) =>
  set({ paymentMethod: method }),
```

## Komendy

```bash
# 1. Rozpakuj
tar xzf palmo-phase5-6-final-steps.tar.gz

# 2. Skopiuj (nadpisz WizardLayout + WizardSidebar!)
cp frontend/src/components/wizard/WizardLayout.tsx \
   frontend/src/components/wizard/WizardSidebar.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/

cp frontend/src/components/wizard/steps/StepRechnung.tsx \
   frontend/src/components/wizard/steps/StepZahlung.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/steps/

# 3. Uzupełnij store i types (Krok A + B)!

# 4. Uruchom
npm run dev
```

## Weryfikacja — kompletny flow 6 kroków

### Step 5 (Rechnungsadresse):
1. ✅ Radio: "wie Abholung" / "wie Zustellung" / "Sonstige"
2. ✅ Klik "wie Abholung" → kopiuje dane z kroku 3
3. ✅ E-Mail pole z walidacją @ 
4. ✅ Anrede: Herr / Frau radio
5. ✅ Vorname + Nachname (split row)
6. ✅ Straße, Adresszusatz, PLZ/Ort z [PL▼]
7. ✅ Telefonnummer, Referenz + "Lade-Referenz kopieren" / "Zustell-Referenz kopieren"
8. ✅ USt-ID/Steuernr. + hint o Reverse Charge
9. ✅ Rechnungs-E-Mail (opcjonalny)
10. ✅ Sidebar: Übersicht z Rechnungsadresse sekcją

### Step 6 (Zahlung):
11. ✅ "Eingaben überprüfen" — pełne podsumowanie w 2 kolumnach
12. ✅ Lewa: Abholung + Sendung + Zusatzservices + Zeitfenster + Preis
13. ✅ Prawa: Zustellung + Rechnungsadresse + Fahrzeugtyp + Gesamtsumme
14. ✅ Każda sekcja z "Bearbeiten" → wraca do odpowiedniego kroku
15. ✅ Sidebar zamieniony na **PaymentPanel** (nie Übersicht!)
16. ✅ 4 metody płatności: Rechnung / Przelewy24 / PayPal (+15,99 zł) / Kreditkarte
17. ✅ "Jetzt kaufen" CTA (żółty)
18. ✅ AGB + Datenschutz disclaimer
19. ✅ Walidacja: wymaga wybrania payment method

### Pełny E2E test:
20. ✅ Krok 1 → 2 → 3 → 4 → 5 → 6 bez błędów
21. ✅ Na kroku 6 klik "Bearbeiten" przy Sendung → wraca do kroku 2
22. ✅ Progress bar: 6 segmentów, zielone = completed, żółty = aktualny
23. ✅ "Jetzt kaufen" → alert z podsumowaniem (tymczasowo)

## Co zmieniono w istniejących plikach

- **WizardLayout.tsx**: usunięto placeholdery, dodano importy StepRechnung + StepZahlung + PaymentPanel. Na Step 6 sidebar = PaymentPanel zamiast WizardSidebar.
- **WizardSidebar.tsx**: dodano sekcję Rechnungsadresse (widoczna od step 5+), ulepszone dane Abholung/Zustellung (pełne adresy od step 3/4+).
