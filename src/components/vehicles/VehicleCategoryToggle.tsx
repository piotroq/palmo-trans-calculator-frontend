/**
 * VehicleCategoryToggle — Przełącznik Express / LKW
 *
 * Dwa taby: "Express (max. 1200kg)" | "LKW (bis 24t Nutzlast)"
 */

import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import type { VehicleCategory } from '../../types/calculator';

const CATEGORIES: { id: VehicleCategory; label: string; sublabel: string }[] = [
  { id: 'express', label: 'Express', sublabel: 'max. 1200kg' },
  { id: 'lkw', label: 'LKW', sublabel: 'bis 24t Nutzlast' },
];

export const VehicleCategoryToggle = () => {
  const { vehicleCategory, setVehicleCategory } = useCalculatorStoreV2();

  return (
    <div className="flex rounded-lg overflow-hidden border-2 border-gray-700">
      {CATEGORIES.map((cat) => {
        const isActive = vehicleCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setVehicleCategory(cat.id)}
            className={`
              flex-1 py-3 px-4 text-center transition-all duration-200
              font-semibold text-sm
              ${isActive
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            {cat.label}{' '}
            <span className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
              ({cat.sublabel})
            </span>
          </button>
        );
      })}
    </div>
  );
};
