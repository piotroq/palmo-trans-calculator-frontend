/**
 * VehicleCardCompact — Kompaktowy wiersz pojazdu
 *
 * Radio + Nazwa + Cena (na jednej linii)
 */

import type { VehicleConfig } from './vehicleData';

interface VehicleCardCompactProps {
  vehicle: VehicleConfig;
  price: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const VehicleCardCompact = ({ vehicle, price, isSelected, onSelect }: VehicleCardCompactProps) => {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-center justify-between
        px-5 py-3.5 rounded-xl border-2 transition-all duration-200
        text-left group
        ${isSelected
          ? 'border-yellow-400 bg-gray-800/80'
          : 'border-gray-700 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Radio circle */}
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${isSelected ? 'border-yellow-400' : 'border-gray-500 group-hover:border-gray-400'}
        `}>
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />}
        </div>

        <span className={`
          font-medium text-sm
          ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
        `}>
          {vehicle.nameDE}
        </span>
      </div>

      <span className={`
        font-bold text-sm whitespace-nowrap
        ${isSelected ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'}
      `}>
        {price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
      </span>
    </button>
  );
};
