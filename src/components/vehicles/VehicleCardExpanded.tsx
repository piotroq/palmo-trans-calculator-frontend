/**
 * VehicleCardExpanded — Rozwinięta karta wybranego pojazdu
 *
 * Pokazuje: radio (checked) + nazwa + cena + wymiary + waga + features + ikony typu ładunku
 */

import type { VehicleConfig } from './vehicleData';

interface VehicleCardExpandedProps {
  vehicle: VehicleConfig;
  price: number;
  isSelected: boolean;
}

export const VehicleCardExpanded = ({ vehicle, price, isSelected }: VehicleCardExpandedProps) => {
  const { maxDimensions: dim, maxWeight, maxPallets, features } = vehicle;

  return (
    <div
      className={`
        rounded-xl border-2 p-5 transition-all duration-200
        ${isSelected
          ? 'border-yellow-400 bg-gray-800/80 shadow-lg shadow-yellow-400/10'
          : 'border-gray-700 bg-gray-800/50'
        }
      `}
    >
      {/* Header: Radio + Name + Price */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${isSelected ? 'border-yellow-400' : 'border-gray-500'}
          `}>
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />}
          </div>
          <span className="font-bold text-white">{vehicle.nameDE}</span>
        </div>
        <span className="text-lg font-bold text-yellow-400 whitespace-nowrap">
          {formatPrice(price)} zł
        </span>
      </div>

      {/* Tags: Dokumente, Pakete, Paletten */}
      <div className="flex flex-wrap gap-2 mb-3 ml-8">
        <Tag icon="📄" label="Dokumente" />
        <Tag icon="📦" label="Pakete" />
        {maxPallets && <Tag icon="🏗️" label={`${maxPallets} EPAL`} />}
      </div>

      {/* Dimensions + Weight */}
      <p className="text-sm text-gray-400 mb-3 ml-8">
        max. {dim.length} x {dim.width} x {dim.height} cm · <span className="font-semibold text-white">max. {formatWeight(maxWeight)}</span>
      </p>

      {/* Features list */}
      <ul className="space-y-1 ml-8">
        {features.map((feat, i) => (
          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
            <span className="text-gray-600 mt-0.5">•</span>
            {feat}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const Tag = ({ icon, label }: { icon: string; label: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-700/50 text-xs text-gray-300 border border-gray-600">
    {icon} {label}
  </span>
);

// ─── Helpers ──────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(0)}t`;
  return `${kg}kg`;
}
