import { describe, it, expect } from 'vitest';

describe('API Service', () => {
  it('should have valid API URL configured', () => {
    const baseUrl = import.meta.env?.VITE_API_URL;
    
    expect(baseUrl).toBeTruthy();
    expect(baseUrl).toMatch(/^https?:\/\//);
  });

  it('should have Google Maps API key configured', () => {
    const mapsKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
    
    expect(mapsKey).toBeTruthy();
    expect(mapsKey?.startsWith('AIza')).toBe(true);
  });

  it('should have PayPal Client ID configured', () => {
    const paypalId = import.meta.env?.VITE_PAYPAL_CLIENT_ID;
    
    expect(paypalId).toBeTruthy();
    expect(paypalId?.length).toBeGreaterThan(10);
  });
});
