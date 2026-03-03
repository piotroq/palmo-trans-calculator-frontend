/**
 * VehicleSelector — Lista pojazdów z rozwijalną sekcją
 *
 * - Wybrany pojazd = rozwinięta karta z detalami
 * - Pozostałe = kompaktowe wiersze (radio + nazwa + cena)
 * - Express: pierwsze 4 widoczne, "Weitere Fahrzeug-Typen" rozwija resztę
 * - LKW: wszystkie widoczne (tylko 4 pojazdy)
 */

import { useState, useMemo } from 'react';
import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import { VehicleCardExpanded } from './VehicleCardExpanded';
import { VehicleCardCompact } from './VehicleCardCompact';
import {
  expressVehicles,
  lkwVehicles,
  EXPRESS_DEFAULT_VISIBLE,
  type VehicleConfig,
} from './vehicleData';

interface VehicleSelectorProps {
  distanceKm: number;
}

export const VehicleSelector = ({ distanceKm }: VehicleSelectorProps) => {
  const { vehicleCategory, vehicleId, setVehicle } = useCalculatorStoreV2();
  const [showAll, setShowAll] = useState(false);

  const vehicles: VehicleConfig[] = useMemo(
    () => (vehicleCategory === 'express' ? expressVehicles : lkwVehicles),
    [vehicleCategory]
  );

  // Ile domyślnie widocznych
  const defaultVisible = vehicleCategory === 'express' ? EXPRESS_DEFAULT_VISIBLE : vehicles.length;
  const visibleVehicles = showAll ? vehicles : vehicles.slice(0, defaultVisible);
  const hasMore = vehicles.length > defaultVisible;

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  // Oblicz cenę za każdy pojazd
  const getPrice = (v: VehicleConfig): number => {
    if (distanceKm <= 0) return v.basePrice;
    return Math.round((v.basePrice + distanceKm * v.pricePerKm) * 100) / 100;
  };

  return (
    <div className="space-y-2">
      {visibleVehicles.map((vehicle) => {
        const isSelected = vehicle.id === vehicleId;
        const price = getPrice(vehicle);

        if (isSelected && selectedVehicle) {
          return (
            <VehicleCardExpanded
              key={vehicle.id}
              vehicle={vehicle}
              price={price}
              isSelected
            />
          );
        }

        return (
          <VehicleCardCompact
            key={vehicle.id}
            vehicle={vehicle}
            price={price}
            isSelected={false}
            onSelect={() => setVehicle(vehicle.id)}
          />
        );
      })}

      {/* Expand/collapse link */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="
            block ml-auto mt-2 text-sm
            text-yellow-400 hover:text-yellow-300
            underline underline-offset-2
            transition-colors
          "
        >
          {showAll ? 'Weniger Fahrzeug-Typen ▲' : 'Weitere Fahrzeug-Typen ▼'}
        </button>
      )}
    </div>
  );
};
