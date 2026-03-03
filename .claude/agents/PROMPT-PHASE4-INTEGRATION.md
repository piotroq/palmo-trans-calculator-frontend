# PALMO-TRANS Calculator — Phase 4: Steps 3-4 (Abholung + Zustellung)

## Nowe pliki (6 plików)

Z archiwum `palmo-phase4-steps3-4.tar.gz`:

| Plik | Lokalizacja | Status |
|------|------------|--------|
| `WizardLayout.tsx` | `src/components/wizard/` | **NADPISZ** |
| `StepAbholung.tsx` | `src/components/wizard/steps/` | **NOWY** |
| `StepZustellung.tsx` | `src/components/wizard/steps/` | **NOWY** |
| `FullAddressForm.tsx` | `src/components/address/` | **NOWY** |
| `TimeWindowSelector.tsx` | `src/components/scheduling/` | **NOWY** |
| `STORE-PATCH-STEPS-3-4.ts` | `src/components/wizard/` | **DOKUMENTACJA** (nie importować!) |

## ⚠️ WAŻNE: Store i Types MUSZĄ mieć pola dla Steps 3-4

Zanim skopiujesz pliki, **przeczytaj `STORE-PATCH-STEPS-3-4.ts`** — zawiera definicje, które muszą być w store i types.

### Krok A: Sprawdź `src/types/calculator.ts`

Musi zawierać:

```typescript
export interface AddressData {
  company: string;
  firstName: string;
  lastName: string;
  street: string;
  addressExtra: string;
  country: string;
  postalCode: string;
  city: string;
  phone: string;
  reference: string;
  notes: string;
}

export interface ScheduleData {
  date: string;
  timeWindowId: string;
  timeSlot?: { from: string; to: string };
}
```

### Krok B: Sprawdź `src/store/calculatorStoreV2.ts`

Musi zawierać w **state**:
```typescript
pickupAddressFull: AddressData;
pickupSchedule: ScheduleData;
deliveryAddressFull: AddressData;
deliverySchedule: ScheduleData;
```

W **initial state**:
```typescript
pickupAddressFull: { company:'', firstName:'', lastName:'', street:'', addressExtra:'', country:'PL', postalCode:'', city:'', phone:'', reference:'', notes:'' },
pickupSchedule: { date:'', timeWindowId:'TW-6H', timeSlot:undefined },
deliveryAddressFull: { company:'', firstName:'', lastName:'', street:'', addressExtra:'', country:'PL', postalCode:'', city:'', phone:'', reference:'', notes:'' },
deliverySchedule: { date:'', timeWindowId:'TW-6H', timeSlot:undefined },
```

W **actions**:
```typescript
updatePickupAddressFull: (data: Partial<AddressData>) =>
  set((s) => ({ pickupAddressFull: { ...s.pickupAddressFull, ...data } })),

updatePickupSchedule: (data: Partial<ScheduleData>) =>
  set((s) => ({ pickupSchedule: { ...s.pickupSchedule, ...data } })),

updateDeliveryAddressFull: (data: Partial<AddressData>) =>
  set((s) => ({ deliveryAddressFull: { ...s.deliveryAddressFull, ...data } })),

updateDeliverySchedule: (data: Partial<ScheduleData>) =>
  set((s) => ({ deliverySchedule: { ...s.deliverySchedule, ...data } })),
```

## Komendy

```bash
# 1. Rozpakuj
tar xzf palmo-phase4-steps3-4.tar.gz

# 2. Skopiuj (nadpisz WizardLayout!)
cp frontend/src/components/wizard/WizardLayout.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/

cp frontend/src/components/wizard/steps/StepAbholung.tsx \
   frontend/src/components/wizard/steps/StepZustellung.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/steps/

cp frontend/src/components/address/FullAddressForm.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/address/

cp frontend/src/components/scheduling/TimeWindowSelector.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/scheduling/

# 3. Uzupełnij store i types (krok A i B powyżej)!

# 4. Uruchom
npm run dev
```

## Weryfikacja

### Step 3 (Abholung):
1. ✅ "Weiter zur Abholung" z kroku 2 → przejście do Step 3
2. ✅ Formularz: Firma, Vorname+Nachname, Straße+Hausnr, Adresszusatz, PLZ/Ort, Telefon, Lade-Referenz, Anmerkungen
3. ✅ Country selector [PL ▼] przy PLZ
4. ✅ ✓ (zielony check) przy wypełnionych polach
5. ✅ Zeitfenster: 6h (Kostenlos) / 3h (+413,82 zł) / Fixzeit (+831,82 zł)
6. ✅ Time slot pills (np. 08:00-14:00)
7. ✅ Walidacja: Vorname, Nachname, Straße, PLZ, Telefon = wymagane
8. ✅ Sidebar Übersicht aktualizuje się z danymi odbioru

### Step 4 (Zustellung):
9. ✅ Identyczny formularz z "Zustell-Referenz" zamiast "Lade-Referenz"
10. ✅ Zeitfenster z offsetem +2h od pickup
11. ✅ LKW: oba time window surcharges = Kostenlos
12. ✅ "Weiter zur Rechnungsadresse" → placeholder Step 5

## Potencjalne problemy

1. **Import paths** — StepAbholung/StepZustellung są w `steps/`, więc importy: `../../../store/`, `../../address/`, `../../scheduling/`
2. **Store brakuje pól** — jeśli TS narzeka na brak `pickupAddressFull` itp., uzupełnij store (krok B powyżej)
3. **deliverySchedule.date** — TimeWindowSelector fallbackuje na `pickupSchedule.date` jeśli delivery date nie jest ustawione
