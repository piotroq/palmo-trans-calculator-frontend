/**
 * AdditionalServicesPanel — Checkboxy usług dodatkowych
 *
 * Wyświetla usługi dostępne dla bieżącej kategorii pojazdów.
 * Każda usługa: checkbox + nazwa + cena + tooltip icon
 */

import { useMemo } from 'react';
import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';

interface ServiceDef {
  id: string;
  nameDE: string;
  price: number;
  availableFor: ('express' | 'lkw')[];
  tooltip?: string;
}

const ALL_SERVICES: ServiceDef[] = [
  { id: 'SVC-01', nameDE: 'Beladehilfe durch Fahrer', price: 119, availableFor: ['express'], tooltip: 'Der Fahrer hilft beim Beladen' },
  { id: 'SVC-02', nameDE: 'Entladehilfe durch Fahrer', price: 119, availableFor: ['express'], tooltip: 'Der Fahrer hilft beim Entladen' },
  { id: 'SVC-03', nameDE: 'Neutrale Abholung/Zustellung', price: 499, availableFor: ['express', 'lkw'], tooltip: 'Fahrzeug ohne Firmenbranding' },
  { id: 'SVC-04', nameDE: 'Papierrechnung', price: 49.99, availableFor: ['express', 'lkw'], tooltip: 'Zusätzliche Papierrechnung per Post' },
  { id: 'SVC-05', nameDE: 'Beladung von oben', price: 399, availableFor: ['lkw'], tooltip: 'Kranbeladung von oben möglich' },
  { id: 'SVC-06', nameDE: 'Hebebühne', price: 619, availableFor: ['lkw'], tooltip: 'LKW mit hydraulischer Hebebühne' },
];

export const AdditionalServicesPanel = () => {
  const { vehicleCategory, selectedServiceIds, toggleService } = useCalculatorStoreV2();

  const services = useMemo(
    () => ALL_SERVICES.filter((s) => s.availableFor.includes(vehicleCategory)),
    [vehicleCategory]
  );

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-5">
      <h4 className="font-bold text-white text-sm mb-1">Zusatzservices</h4>
      <p className="text-xs text-gray-500 mb-4">Mehrfachauswahl möglich</p>

      <div className="space-y-3">
        {services.map((service) => {
          const isChecked = selectedServiceIds.includes(service.id);

          return (
            <label
              key={service.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              {/* Custom checkbox */}
              <div
                onClick={() => toggleService(service.id)}
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  transition-all duration-150
                  ${isChecked
                    ? 'bg-yellow-400 border-yellow-400'
                    : 'border-gray-500 group-hover:border-gray-400'
                  }
                `}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div
                className="flex-1"
                onClick={() => toggleService(service.id)}
              >
                <span className={`
                  text-sm leading-tight
                  ${isChecked ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                `}>
                  {service.nameDE}{' '}
                  <span className="text-gray-500">
                    (+{service.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} zł)
                  </span>
                </span>
              </div>

              {/* Tooltip icon */}
              {service.tooltip && (
                <span
                  className="text-gray-500 hover:text-gray-300 cursor-help flex-shrink-0 mt-0.5"
                  title={service.tooltip}
                >
                  ⓘ
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};
