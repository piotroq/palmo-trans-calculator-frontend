/**
 * Step 1: Preis — Jetzt Preis für Kurierfahrt kalkulieren
 *
 * Główny kontener kroku 1. Orchestruje:
 * AddressInputs → CategoryToggle → VehicleSelector + Services → DateSelector → PriceSummary
 */

import { useEffect, useCallback } from 'react';
import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { calculateDistance, quickQuote } from '../../../services/apiV2';
import { AddressInput } from '../../address/AddressInput';
import { VehicleCategoryToggle } from '../../vehicles/VehicleCategoryToggle';
import { VehicleSelector } from '../../vehicles/VehicleSelector';
import { AdditionalServicesPanel } from '../../services/AdditionalServicesPanel';
import { DateSelector } from '../../scheduling/DateSelector';
import { TimeWindowPreview } from '../../scheduling/TimeWindowPreview';
import { PriceSummary } from '../../ui/PriceSummary';
import { StepNavigation } from '../../ui/StepNavigation';

export const StepPreis = () => {
  const {
    pickupAddress,
    pickupCoords,
    deliveryAddress,
    deliveryCoords,
    vehicleCategory,
    vehicleId,
    selectedServiceIds,
    distanceKm,
    pricing,
    isCalculating,
    errors,
    setPickupAddress,
    setDeliveryAddress,
    setDistanceKm,
    setPricing,
    setIsCalculating,
    setError,
    clearError,
    goNext,
    markStepCompleted,
  } = useCalculatorStoreV2();

  // Przelicz dystans gdy oba adresy są zgeokodowane
  useEffect(() => {
    if (!pickupCoords || !deliveryCoords) return;

    const calc = async () => {
      try {
        const result = await calculateDistance(pickupCoords, deliveryCoords);
        setDistanceKm(result.distanceKm);
      } catch (err) {
        console.error('Distance calculation failed:', err);
      }
    };
    calc();
  }, [pickupCoords, deliveryCoords, setDistanceKm]);

  // Przelicz cenę gdy zmieni się pojazd, dystans lub usługi
  const recalculatePrice = useCallback(async () => {
    if (distanceKm <= 0 || !vehicleId) return;

    setIsCalculating(true);
    try {
      const result = await quickQuote(vehicleId, distanceKm, selectedServiceIds);
      setPricing({
        vehicleId,
        vehicleName: result.vehicleName,
        vehicleCategory,
        vehicleBasePrice: 0,
        distanceCharge: 0,
        servicesTotal: 0,
        pickupTimeWindowSurcharge: 0,
        deliveryTimeWindowSurcharge: 0,
        subtotal: result.price,
        vatRate: 0,
        vatAmount: 0,
        total: result.price,
        distanceKm,
        estimatedDuration: '',
        pricePerKm: 0,
        breakdown: [],
      });
    } catch (err) {
      console.error('Quick quote failed:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [distanceKm, vehicleId, selectedServiceIds, vehicleCategory, setIsCalculating, setPricing]);

  useEffect(() => {
    recalculatePrice();
  }, [recalculatePrice]);

  // Walidacja przed przejściem do kroku 2
  const handleNext = () => {
    let valid = true;

    if (!pickupAddress.trim() || !pickupCoords) {
      setError('pickupAddress', 'Bitte Abholadresse eingeben');
      valid = false;
    } else {
      clearError('pickupAddress');
    }

    if (!deliveryAddress.trim() || !deliveryCoords) {
      setError('deliveryAddress', 'Bitte Zustelladresse eingeben');
      valid = false;
    } else {
      clearError('deliveryAddress');
    }

    if (!vehicleId) {
      setError('vehicleId', 'Bitte Fahrzeug wählen');
      valid = false;
    }

    if (valid) {
      markStepCompleted(1);
      goNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Jetzt Preis für{' '}
          {vehicleCategory === 'express' ? 'Kurierfahrt' : 'LKW-Transport'}{' '}
          kalkulieren
        </h2>
      </div>

      {/* ── Address Inputs ── */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
        <AddressInput
          label="Abholung"
          value={pickupAddress}
          coords={pickupCoords}
          error={errors.pickupAddress}
          onChange={(addr, coords) => {
            setPickupAddress(addr, coords);
            if (addr.trim()) clearError('pickupAddress');
          }}
        />
        <AddressInput
          label="Zustellung"
          value={deliveryAddress}
          coords={deliveryCoords}
          error={errors.deliveryAddress}
          onChange={(addr, coords) => {
            setDeliveryAddress(addr, coords);
            if (addr.trim()) clearError('deliveryAddress');
          }}
        />
        {distanceKm > 0 && (
          <p className="text-sm text-gray-400 text-right">
            📍 Geschätzte Entfernung: <span className="text-yellow-400 font-semibold">{distanceKm} km</span>
          </p>
        )}
      </div>

      {/* ── Category Toggle ── */}
      <VehicleCategoryToggle />

      {/* ── Vehicles + Services (side by side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Fahrzeug</h3>
          <VehicleSelector distanceKm={distanceKm} />
        </div>
        <div>
          <AdditionalServicesPanel />
        </div>
      </div>

      {/* ── Date Selector ── */}
      <DateSelector />

      {/* ── Time Window Preview ── */}
      <TimeWindowPreview />

      {/* ── Price Summary ── */}
      <PriceSummary
        total={pricing?.total ?? 0}
        isCalculating={isCalculating}
      />

      {/* ── Navigation ── */}
      <StepNavigation
        onNext={handleNext}
        nextLabel="Weiter zur Sendung"
        showBack={false}
      />
    </div>
  );
};
