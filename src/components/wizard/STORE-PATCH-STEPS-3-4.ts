/**
 * STORE & TYPES PATCH — Instrukcja dla Claude Code / Qwen Code
 *
 * Kroki 3-4 wymagają pól, które mogą nie istnieć w aktualnym store i types.
 * Poniżej definicje, które MUSZĄ być obecne.
 */

// ══════════════════════════════════════════════════════════════
// 1. TYPES — Dodaj do src/types/calculator.ts (jeśli brak)
// ══════════════════════════════════════════════════════════════

/*

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
  date: string;          // ISO date "2026-03-05"
  timeWindowId: string;  // 'TW-6H' | 'TW-3H' | 'TW-FIX'
  timeSlot?: {
    from: string;        // "08:00"
    to: string;          // "14:00"
  };
}

*/

// ══════════════════════════════════════════════════════════════
// 2. DEFAULT VALUES — Fabryka pustego AddressData
// ══════════════════════════════════════════════════════════════

export const emptyAddressData = (): AddressData => ({
  company: '',
  firstName: '',
  lastName: '',
  street: '',
  addressExtra: '',
  country: 'PL',
  postalCode: '',
  city: '',
  phone: '',
  reference: '',
  notes: '',
});

export const emptyScheduleData = (): ScheduleData => ({
  date: '',
  timeWindowId: 'TW-6H',
  timeSlot: undefined,
});

// ══════════════════════════════════════════════════════════════
// 3. STORE — Dodaj do calculatorStoreV2.ts (jeśli brak)
// ══════════════════════════════════════════════════════════════

/*

W state:

  // Step 3: Abholung
  pickupAddressFull: AddressData;
  pickupSchedule: ScheduleData;

  // Step 4: Zustellung
  deliveryAddressFull: AddressData;
  deliverySchedule: ScheduleData;


W initial state:

  pickupAddressFull: emptyAddressData(),
  pickupSchedule: emptyScheduleData(),
  deliveryAddressFull: emptyAddressData(),
  deliverySchedule: emptyScheduleData(),


W actions:

  updatePickupAddressFull: (data: Partial<AddressData>) =>
    set((s) => ({
      pickupAddressFull: { ...s.pickupAddressFull, ...data },
    })),

  updatePickupSchedule: (data: Partial<ScheduleData>) =>
    set((s) => ({
      pickupSchedule: { ...s.pickupSchedule, ...data },
    })),

  updateDeliveryAddressFull: (data: Partial<AddressData>) =>
    set((s) => ({
      deliveryAddressFull: { ...s.deliveryAddressFull, ...data },
    })),

  updateDeliverySchedule: (data: Partial<ScheduleData>) =>
    set((s) => ({
      deliverySchedule: { ...s.deliverySchedule, ...data },
    })),

*/

// ══════════════════════════════════════════════════════════════
// Ten plik nie jest importowany nigdzie — służy jako dokumentacja.
// ══════════════════════════════════════════════════════════════

type AddressData = import('../../types/calculator').AddressData;
type ScheduleData = import('../../types/calculator').ScheduleData;
