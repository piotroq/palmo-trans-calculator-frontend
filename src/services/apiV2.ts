/**
 * PALMO-TRANS Calculator v2 — API Service
 *
 * Axios client do komunikacji z backendem v2.
 */

import axios from 'axios';
import type {
  Vehicle,
  AdditionalService,
  TimeWindow,
  ShipmentCategory,
  PaymentMethod,
  PricingResult,
  VehicleCategory,
} from '../types/calculator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/v2`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── VEHICLES ─────────────────────────────────────────────────

export async function fetchVehicles(category?: VehicleCategory): Promise<Vehicle[]> {
  const params = category ? { category } : {};
  const { data } = await api.get('/vehicles', { params });

  if (category) return data.data;
  // Jeśli brak category, API zwraca { express: [...], lkw: [...] }
  return [...data.data.express, ...data.data.lkw];
}

export async function fetchVehiclesByCategory(): Promise<{
  express: Vehicle[];
  lkw: Vehicle[];
}> {
  const { data } = await api.get('/vehicles');
  return data.data;
}

// ─── SERVICES ─────────────────────────────────────────────────

export async function fetchServices(category?: VehicleCategory): Promise<AdditionalService[]> {
  const params = category ? { category } : {};
  const { data } = await api.get('/services', { params });
  return data.data;
}

// ─── TIME WINDOWS ─────────────────────────────────────────────

export async function fetchTimeWindows(): Promise<TimeWindow[]> {
  const { data } = await api.get('/time-windows');
  return data.data;
}

// ─── TIME SLOTS ───────────────────────────────────────────────

export interface TimeSlot {
  from: string;
  to: string;
  available: boolean;
}

export interface TimeSlotsResponse {
  date: string;
  category: string;
  slots: TimeSlot[];
  minDate: string;
  maxDate: string;
}

export async function fetchTimeSlots(
  date: string,
  category: VehicleCategory = 'express'
): Promise<TimeSlotsResponse> {
  const { data } = await api.get(`/timeslots/${date}`, { params: { category } });
  return data.data;
}

// ─── SHIPMENT CATEGORIES ──────────────────────────────────────

export async function fetchShipmentCategories(): Promise<ShipmentCategory[]> {
  const { data } = await api.get('/shipment-categories');
  return data.data;
}

// ─── PAYMENT METHODS ──────────────────────────────────────────

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await api.get('/payment-methods');
  return data.data;
}

// ─── PRICING ──────────────────────────────────────────────────

export interface CalculateRequest {
  vehicleId: string;
  distanceKm: number;
  serviceIds: string[];
  pickupTimeWindowId: string;
  deliveryTimeWindowId: string;
  isReverseCharge: boolean;
}

export async function calculatePrice(req: CalculateRequest): Promise<PricingResult> {
  const { data } = await api.post('/calculate', req);
  if (!data.success) throw new Error(data.error || 'Calculation failed');
  return data.data;
}

export async function quickQuote(
  vehicleId: string,
  distanceKm: number,
  serviceIds?: string[]
): Promise<{ price: number; vehicleName: string }> {
  const { data } = await api.post('/quick-quote', { vehicleId, distanceKm, serviceIds });
  if (!data.success) throw new Error(data.error || 'Quick quote failed');
  return data.data;
}

// ─── GEOCODING (stary endpoint, bez zmian) ────────────────────

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const { data } = await axios.post(`${API_URL}/api/geocode`, { address });
  return { lat: data.lat, lng: data.lng };
}

// ─── DISTANCE (Google Distance Matrix via backend) ────────────

export async function calculateDistance(
  pickupCoords: { lat: number; lng: number },
  deliveryCoords: { lat: number; lng: number }
): Promise<{ distanceKm: number; durationMinutes: number }> {
  // Haversine fallback — obliczanie po stronie klienta jeśli backend nie ma endpointu
  const R = 6371;
  const dLat = toRad(deliveryCoords.lat - pickupCoords.lat);
  const dLng = toRad(deliveryCoords.lng - pickupCoords.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickupCoords.lat)) *
      Math.cos(toRad(deliveryCoords.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Mnożnik 1.3 dla szacunku dystansu drogowego
  const roadDistance = Math.round(straightLine * 1.3);
  const duration = Math.round(roadDistance / 70 * 60); // ~70 km/h

  return { distanceKm: roadDistance, durationMinutes: duration };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── BOOKING ──────────────────────────────────────────────────

export interface CreateBookingRequest {
  // Pricing
  vehicleId: string;
  vehicleCategory: VehicleCategory;
  distanceKm: number;
  pricing: PricingResult;
  selectedServiceIds: string[];

  // Shipment
  packages: Array<{
    categoryId: string;
    description: string;
    quantity: number;
    stackable: boolean;
    weight: number;
    length: number;
    width: number;
    height: number;
  }>;
  additionalInfo: string;

  // Addresses
  pickup: {
    address: Record<string, string>;
    schedule: { date: string; timeWindowId: string; timeFrom?: string; timeTo?: string };
    coords: { lat: number; lng: number };
  };
  delivery: {
    address: Record<string, string>;
    schedule: { date: string; timeWindowId: string; timeFrom?: string; timeTo?: string };
    coords: { lat: number; lng: number };
  };

  // Invoice
  invoice: Record<string, string>;

  // Payment
  paymentMethod: string;
}

export async function createBooking(req: CreateBookingRequest): Promise<{
  bookingId: string;
  bookingNumber: string;
  paymentUrl?: string;
}> {
  const { data } = await api.post('/booking', req);
  if (!data.success) throw new Error(data.error || 'Booking failed');
  return data.data;
}

export default api;
