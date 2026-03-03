/**
 * PALMO-TRANS Calculator v2 — Zustand Store
 *
 * Centralny store dla 6-krokowego wizarda.
 * Każdy slice zarządza swoim krokiem.
 */

import { create } from 'zustand';
import type {
  WizardStep,
  VehicleCategory,
  Package,
  AddressData,
  ScheduleData,
  InvoiceData,
  InvoiceSource,
  PaymentMethodId,
  PricingResult,
  Coordinates,
} from '../types/calculator';

// ─── INITIAL VALUES ───────────────────────────────────────────

const emptyAddress: AddressData = {
  company: '',
  firstName: '',
  lastName: '',
  street: '',
  addressExtra: '',
  postalCode: '',
  city: '',
  country: 'PL',
  phone: '',
  reference: '',
  notes: '',
};

const defaultSchedule: ScheduleData = {
  date: '',
  timeWindowId: 'TW-6H',
  timeSlot: undefined,
  fixedTime: undefined,
};

const emptyInvoice: InvoiceData = {
  source: 'custom',
  email: '',
  company: '',
  salutation: 'Herr',
  firstName: '',
  lastName: '',
  street: '',
  addressExtra: '',
  postalCode: '',
  city: '',
  country: 'PL',
  phone: '',
  reference: '',
  vatId: '',
  billingEmail: '',
};

// ─── STORE INTERFACE ──────────────────────────────────────────

interface CalculatorStoreV2 {
  // ── Wizard Navigation ──
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  setStep: (step: WizardStep) => void;
  markStepCompleted: (step: WizardStep) => void;
  canNavigateTo: (step: WizardStep) => boolean;
  goNext: () => void;
  goBack: () => void;

  // ── Step 1: Preis ──
  pickupAddress: string;
  pickupCoords: Coordinates | null;
  deliveryAddress: string;
  deliveryCoords: Coordinates | null;
  vehicleCategory: VehicleCategory;
  vehicleId: string;
  selectedServiceIds: string[];
  setPickupAddress: (address: string, coords?: Coordinates) => void;
  setDeliveryAddress: (address: string, coords?: Coordinates) => void;
  setVehicleCategory: (category: VehicleCategory) => void;
  setVehicle: (vehicleId: string) => void;
  toggleService: (serviceId: string) => void;
  setSelectedServices: (ids: string[]) => void;

  // ── Step 2: Sendung ──
  packages: Package[];
  additionalInfo: string;
  addPackage: (pkg: Package) => void;
  updatePackage: (id: string, data: Partial<Package>) => void;
  removePackage: (id: string) => void;
  setAdditionalInfo: (info: string) => void;

  // ── Step 3: Abholung ──
  pickupAddressFull: AddressData;
  pickupSchedule: ScheduleData;
  updatePickupAddress: (data: Partial<AddressData>) => void;
  updatePickupSchedule: (data: Partial<ScheduleData>) => void;

  // ── Step 4: Zustellung ──
  deliveryAddressFull: AddressData;
  deliverySchedule: ScheduleData;
  updateDeliveryAddress: (data: Partial<AddressData>) => void;
  updateDeliverySchedule: (data: Partial<ScheduleData>) => void;

  // ── Step 5: Rechnungsadresse ──
  invoice: InvoiceData;
  updateInvoice: (data: Partial<InvoiceData>) => void;
  copyAddressToInvoice: (source: InvoiceSource) => void;

  // ── Step 6: Zahlung ──
  paymentMethod: PaymentMethodId;
  setPaymentMethod: (method: PaymentMethodId) => void;

  // ── Pricing ──
  pricing: PricingResult | null;
  distanceKm: number;
  isCalculating: boolean;
  setPricing: (result: PricingResult) => void;
  setDistanceKm: (km: number) => void;
  setIsCalculating: (val: boolean) => void;

  // ── Errors ──
  errors: Record<string, string>;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // ── Global ──
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  resetForm: () => void;
}

// ─── STORE IMPLEMENTATION ─────────────────────────────────────

export const useCalculatorStoreV2 = create<CalculatorStoreV2>((set, get) => ({
  // ── Wizard Navigation ──
  currentStep: 1,
  completedSteps: new Set<WizardStep>(),

  setStep: (step) => set({ currentStep: step }),

  markStepCompleted: (step) =>
    set((state) => {
      const newSet = new Set(state.completedSteps);
      newSet.add(step);
      return { completedSteps: newSet };
    }),

  canNavigateTo: (step) => {
    const { completedSteps, currentStep } = get();
    if (step === 1) return true;
    if (step <= currentStep) return true;
    // Można przejść do następnego kroku tylko jeśli poprzedni jest ukończony
    return completedSteps.has((step - 1) as WizardStep);
  },

  goNext: () =>
    set((state) => {
      const next = Math.min(state.currentStep + 1, 6) as WizardStep;
      const newCompleted = new Set(state.completedSteps);
      newCompleted.add(state.currentStep);
      return { currentStep: next, completedSteps: newCompleted };
    }),

  goBack: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as WizardStep,
    })),

  // ── Step 1: Preis ──
  pickupAddress: '',
  pickupCoords: null,
  deliveryAddress: '',
  deliveryCoords: null,
  vehicleCategory: 'express',
  vehicleId: 'EXP-01',
  selectedServiceIds: [],

  setPickupAddress: (address, coords) =>
    set({ pickupAddress: address, ...(coords ? { pickupCoords: coords } : {}) }),

  setDeliveryAddress: (address, coords) =>
    set({ deliveryAddress: address, ...(coords ? { deliveryCoords: coords } : {}) }),

  setVehicleCategory: (category) =>
    set({
      vehicleCategory: category,
      vehicleId: category === 'express' ? 'EXP-01' : 'LKW-01',
      selectedServiceIds: [], // reset services bo inne per category
    }),

  setVehicle: (vehicleId) => set({ vehicleId }),

  toggleService: (serviceId) =>
    set((state) => {
      const ids = state.selectedServiceIds.includes(serviceId)
        ? state.selectedServiceIds.filter((id) => id !== serviceId)
        : [...state.selectedServiceIds, serviceId];
      return { selectedServiceIds: ids };
    }),

  setSelectedServices: (ids) => set({ selectedServiceIds: ids }),

  // ── Step 2: Sendung ──
  packages: [],
  additionalInfo: '',

  addPackage: (pkg) =>
    set((state) => ({ packages: [...state.packages, pkg] })),

  updatePackage: (id, data) =>
    set((state) => ({
      packages: state.packages.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  removePackage: (id) =>
    set((state) => ({
      packages: state.packages.filter((p) => p.id !== id),
    })),

  setAdditionalInfo: (info) => set({ additionalInfo: info }),

  // ── Step 3: Abholung ──
  pickupAddressFull: { ...emptyAddress },
  pickupSchedule: { ...defaultSchedule },

  updatePickupAddress: (data) =>
    set((state) => ({
      pickupAddressFull: { ...state.pickupAddressFull, ...data },
    })),

  updatePickupSchedule: (data) =>
    set((state) => ({
      pickupSchedule: { ...state.pickupSchedule, ...data },
    })),

  // ── Step 4: Zustellung ──
  deliveryAddressFull: { ...emptyAddress },
  deliverySchedule: { ...defaultSchedule },

  updateDeliveryAddress: (data) =>
    set((state) => ({
      deliveryAddressFull: { ...state.deliveryAddressFull, ...data },
    })),

  updateDeliverySchedule: (data) =>
    set((state) => ({
      deliverySchedule: { ...state.deliverySchedule, ...data },
    })),

  // ── Step 5: Rechnungsadresse ──
  invoice: { ...emptyInvoice },

  updateInvoice: (data) =>
    set((state) => ({
      invoice: { ...state.invoice, ...data },
    })),

  copyAddressToInvoice: (source) =>
    set((state) => {
      const addr = source === 'pickup' ? state.pickupAddressFull : state.deliveryAddressFull;
      return {
        invoice: {
          ...state.invoice,
          source,
          company: addr.company,
          firstName: addr.firstName,
          lastName: addr.lastName,
          street: addr.street,
          addressExtra: addr.addressExtra,
          postalCode: addr.postalCode,
          city: addr.city,
          country: addr.country,
          phone: addr.phone,
        },
      };
    }),

  // ── Step 6: Zahlung ──
  paymentMethod: 'rechnung',
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // ── Pricing ──
  pricing: null,
  distanceKm: 0,
  isCalculating: false,

  setPricing: (result) => set({ pricing: result }),
  setDistanceKm: (km) => set({ distanceKm: km }),
  setIsCalculating: (val) => set({ isCalculating: val }),

  // ── Errors ──
  errors: {},

  setError: (field, message) =>
    set((state) => ({ errors: { ...state.errors, [field]: message } })),

  clearError: (field) =>
    set((state) => {
      const { [field]: _, ...rest } = state.errors;
      return { errors: rest };
    }),

  clearAllErrors: () => set({ errors: {} }),

  // ── Global ──
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),

  resetForm: () =>
    set({
      currentStep: 1,
      completedSteps: new Set(),
      pickupAddress: '',
      pickupCoords: null,
      deliveryAddress: '',
      deliveryCoords: null,
      vehicleCategory: 'express',
      vehicleId: 'EXP-01',
      selectedServiceIds: [],
      packages: [],
      additionalInfo: '',
      pickupAddressFull: { ...emptyAddress },
      pickupSchedule: { ...defaultSchedule },
      deliveryAddressFull: { ...emptyAddress },
      deliverySchedule: { ...defaultSchedule },
      invoice: { ...emptyInvoice },
      paymentMethod: 'rechnung',
      pricing: null,
      distanceKm: 0,
      isCalculating: false,
      errors: {},
      isLoading: false,
    }),
}));
