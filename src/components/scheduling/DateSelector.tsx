/**
 * DateSelector — Wybór daty załadunku
 *
 * Pill buttons: Heute | Morgen | Śr. 05.03 | Czw. 06.03 | Datum wählen
 * Wzorowane na Zipmend: "Ladedatum wählen"
 */

import { useState, useMemo } from 'react';
import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';

const DAY_NAMES_DE: Record<number, string> = {
  0: 'So.',
  1: 'Mo.',
  2: 'Di.',
  3: 'Mi.',
  4: 'Do.',
  5: 'Fr.',
  6: 'Sa.',
};

export const DateSelector = () => {
  const { pickupSchedule, updatePickupSchedule, vehicleCategory } = useCalculatorStoreV2();
  const [showCustomDate, setShowCustomDate] = useState(false);

  const dateOptions = useMemo(() => {
    const now = new Date();
    const options: { label: string; date: string; disabled: boolean }[] = [];

    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');

      let label: string;
      if (i === 0) {
        // Heute po 16:00 = disabled
        label = `Heute ${dd}.${mm}.`;
      } else if (i === 1) {
        label = `Morgen ${dd}.${mm}.`;
      } else {
        label = `${DAY_NAMES_DE[d.getDay()]} ${dd}.${mm}.`;
      }

      const disabled = i === 0 && now.getHours() >= 16;

      options.push({ label, date: dateStr, disabled });
    }

    return options;
  }, []);

  const selectedDate = pickupSchedule.date;

  const handleSelectDate = (date: string) => {
    setShowCustomDate(false);
    updatePickupSchedule({ date });
  };

  const title = vehicleCategory === 'lkw'
    ? 'Be- und Entladezeiten wählen'
    : 'Ladedatum wählen';

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {dateOptions.map((opt) => (
          <button
            key={opt.date}
            onClick={() => !opt.disabled && handleSelectDate(opt.date)}
            disabled={opt.disabled}
            className={`
              px-4 py-2.5 rounded-lg border-2 text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${opt.disabled
                ? 'border-gray-700 bg-gray-800 text-gray-600 cursor-not-allowed line-through'
                : selectedDate === opt.date
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400 hover:text-white'
              }
            `}
          >
            {selectedDate === opt.date && (
              <span className="mr-1.5">●</span>
            )}
            {opt.label}
          </button>
        ))}

        {/* Custom date picker */}
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className={`
            px-4 py-2.5 rounded-lg border-2 text-sm font-medium
            transition-all duration-200
            ${showCustomDate
              ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
              : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400 hover:text-white'
            }
          `}
        >
          📅 Datum wählen
        </button>
      </div>

      {/* Custom date input */}
      {showCustomDate && (
        <div className="mt-3">
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            max={getMaxDate()}
            value={selectedDate}
            onChange={(e) => handleSelectDate(e.target.value)}
            className="
              px-4 py-2.5 rounded-lg
              bg-gray-700 text-white border-2 border-gray-600
              focus:outline-none focus:border-yellow-400
            "
          />
        </div>
      )}
    </div>
  );
};

function getMaxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}
