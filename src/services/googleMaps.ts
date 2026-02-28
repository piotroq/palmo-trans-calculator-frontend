import type { Coordinates, RouteInfo } from '../types/index';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

export async function calculateRoute(
  pickupCoords: Coordinates,
  deliveryCoords: Coordinates,
  weight: number,
  serviceType: 'standard' | 'express'
): Promise<RouteInfo> {
  try {
    const response = await fetch(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origins: [`${pickupCoords.lat},${pickupCoords.lng}`],
          destinations: [`${deliveryCoords.lat},${deliveryCoords.lng}`],
          key: GOOGLE_MAPS_API_KEY,
          units: 'metric',
        }),
      }
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      throw new Error('Nie można obliczyć trasy.');
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      throw new Error('Adres niedostępny.');
    }

    const distanceMeters = element.distance.value;
    const distanceKm = distanceMeters / 1000;

    const pricing = getPricingConfig();
    let cost = pricing.baseFee + distanceKm * pricing.perKmFee;

    const weightMultiplier = pricing.weightTiers.find(
      (t) => weight <= t.maxWeight
    )?.multiplier || 1;
    cost *= weightMultiplier;

    if (serviceType === 'express') {
      cost *= pricing.expressMultiplier;
    }

    return {
      distance: distanceMeters,
      duration: element.duration.value,
      cost: Math.round(cost * 100) / 100,
    };
  } catch (error) {
    console.error('Google Maps error:', error);
    throw error;
  }
}

/**
 * Geocodowanie przez backend (unika CORS)
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  try {
    const response = await fetch(`${API_URL}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Adres nie znaleziony');
    }

    const data = await response.json();
    return {
      lat: data.lat,
      lng: data.lng,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

function getPricingConfig() {
  return {
    baseFee: 25,
    perKmFee: 3.5,
    minDistance: 5,
    expressMultiplier: 1.5,
    weightTiers: [
      { maxWeight: 5, multiplier: 1 },
      { maxWeight: 20, multiplier: 1.2 },
      { maxWeight: 50, multiplier: 1.5 },
      { maxWeight: Infinity, multiplier: 2 },
    ],
  };
}
