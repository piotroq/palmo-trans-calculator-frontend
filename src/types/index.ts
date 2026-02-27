export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeightTier {
  maxWeight: number;
  multiplier: number;
}

export interface PricingConfig {
  baseFee: number;
  perKmFee: number;
  minDistance: number;
  expressMultiplier: number;
  weightTiers: WeightTier[];
}

export interface DeliveryRequest {
  pickupAddress: string;
  pickupCoords: Coordinates;
  deliveryAddress: string;
  deliveryCoords: Coordinates;
  weight: number;
  serviceType: 'standard' | 'express';
  additionalServices: {
    insurance: boolean;
    signatureRequired: boolean;
    timeSlot: boolean;
  };
  estimatedDistance: number;
  estimatedDuration: number;
  estimatedPrice: number;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

export interface SubmissionResponse {
  id: number;
  submissionData: DeliveryRequest;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  referenceNumber: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  cost: number;
}
