/**
 * PALMO-TRANS Calculator v2 — Frontend Types
 *
 * Wspólne typy dla 6-krokowego wizarda.
 */

// ─── WIZARD ───────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export const WIZARD_STEPS = [
  { step: 1, key: 'price', labelDE: 'Preis', icon: 'euro' },
  { step: 2, key: 'shipment', labelDE: 'Sendung', icon: 'inventory_2' },
  { step: 3, key: 'pickup', labelDE: 'Abholung', icon: 'upload' },
  { step: 4, key: 'delivery', labelDE: 'Zustellung', icon: 'download' },
  { step: 5, key: 'invoice', labelDE: 'Rechnungsadresse', icon: 'receipt_long' },
  { step: 6, key: 'payment', labelDE: 'Zahlung', icon: 'credit_card' },
] as const;

// ─── VEHICLE ──────────────────────────────────────────────────

export type VehicleCategory = 'express' | 'lkw';

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  name: string;
  nameDE: string;
  maxDimensions: { length: number; width: number; height: number };
  maxWeight: number;
  maxPallets?: number;
  basePrice: number;
  pricePerKm: number;
  features: string[];
  availableServices: string[];
  imageSlug: string;
  sortOrder: number;
}

// ─── ADDITIONAL SERVICES ──────────────────────────────────────

export interface AdditionalService {
  id: string;
  name: string;
  nameDE: string;
  price: number;
  availableFor: VehicleCategory[];
  tooltip?: string;
}

// ─── TIME WINDOW ──────────────────────────────────────────────

export interface TimeWindow {
  id: string;
  name: string;
  nameDE: string;
  hours: number;
  surcharge: { express: number; lkw: number };
}

// ─── SHIPMENT (Sendung) ──────────────────────────────────────

export interface ShipmentCategory {
  id: string;
  name: string;
  nameDE: string;
  icon: string;
  defaultDimensions?: { length: number; width: number; height: number };
  defaultWeight?: number;
}

export interface Package {
  id: string; // UUID
  categoryId: string;
  description: string;
  quantity: number;
  stackable: boolean;
  weight: number; // kg per Packstück
  length: number; // cm
  width: number;
  height: number;
}

// ─── ADDRESS ──────────────────────────────────────────────────

export interface AddressData {
  company: string;
  firstName: string;
  lastName: string;
  street: string;
  addressExtra: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  reference: string;
  notes: string;
}

// ─── COORDINATES ──────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

// ─── SCHEDULE ─────────────────────────────────────────────────

export interface ScheduleData {
  date: string; // YYYY-MM-DD
  timeWindowId: string; // TW-6H, TW-3H, TW-FIX
  timeSlot?: { from: string; to: string }; // np. "08:00" - "14:00"
  fixedTime?: string; // np. "08:00" (dla Fixzeit)
}

// ─── INVOICE (Rechnungsadresse) ──────────────────────────────

export type InvoiceSource = 'pickup' | 'delivery' | 'custom';
export type Salutation = 'Herr' | 'Frau';

export interface InvoiceData {
  source: InvoiceSource;
  email: string;
  company: string;
  salutation: Salutation;
  firstName: string;
  lastName: string;
  street: string;
  addressExtra: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  reference: string;
  vatId: string; // USt-ID/Steuernr.
  billingEmail: string;
}

// ─── PAYMENT ──────────────────────────────────────────────────

export type PaymentMethodId = 'rechnung' | 'przelewy24' | 'paypal' | 'kreditkarte';

export interface PaymentMethod {
  id: string;
  name: string;
  nameDE: string;
  description?: string;
  icon: string;
  transactionFee: number;
  enabled: boolean;
  businessOnly?: boolean;
}

// ─── PRICING RESULT ───────────────────────────────────────────

export interface PriceBreakdownItem {
  id: string;
  label: string;
  labelDE: string;
  amount: number;
  type: 'vehicle_base' | 'distance' | 'service' | 'time_window' | 'payment_fee';
}

export interface PricingResult {
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: VehicleCategory;
  vehicleBasePrice: number;
  distanceCharge: number;
  servicesTotal: number;
  pickupTimeWindowSurcharge: number;
  deliveryTimeWindowSurcharge: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  distanceKm: number;
  estimatedDuration: string;
  pricePerKm: number;
  breakdown: PriceBreakdownItem[];
}

// ─── COMPLETE BOOKING STATE ──────────────────────────────────

export interface BookingState {
  // Step 1: Preis
  pickupAddress: string;
  pickupCoords: Coordinates | null;
  deliveryAddress: string;
  deliveryCoords: Coordinates | null;
  vehicleCategory: VehicleCategory;
  vehicleId: string;
  selectedServiceIds: string[];
  
  // Step 2: Sendung
  packages: Package[];
  additionalInfo: string;
  
  // Step 3: Abholung
  pickupAddress_full: AddressData;
  pickupSchedule: ScheduleData;
  
  // Step 4: Zustellung
  deliveryAddress_full: AddressData;
  deliverySchedule: ScheduleData;
  
  // Step 5: Rechnungsadresse
  invoice: InvoiceData;
  
  // Step 6: Zahlung
  paymentMethod: PaymentMethodId;
  
  // Pricing (obliczane)
  pricing: PricingResult | null;
  distanceKm: number;
}
