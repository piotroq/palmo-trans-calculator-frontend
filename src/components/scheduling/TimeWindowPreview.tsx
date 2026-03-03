/**
 * TimeWindowPreview — Podgląd najwcześniejszych okien Abholung/Zustellung
 *
 * Wyświetla szacowane okna czasowe na podstawie wybranej daty.
 * Szczegółowe ustawianie czasu będzie w krokach 3-4.
 */

import { useMemo } from 'react';
import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';

export const TimeWindowPreview = () => {
  const { pickupSchedule, pickupAddress, deliveryAddress, vehicleCategory } = useCalculatorStoreV2();

  const selectedDate = pickupSchedule.date;

  // Generuj szacowane okna
  const windows = useMemo(() => {
    if (!selectedDate) return null;

    const date = new Date(selectedDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    // Szacowana godzina startu
    let pickupStart: number;
    if (isToday) {
      pickupStart = Math.max(now.getHours() + 2, 8);
    } else {
      pickupStart = 8;
    }

    const pickupEnd = Math.min(pickupStart + 2, 20);

    // Delivery = ~1.5h po pickup
    const deliveryStart = Math.min(pickupStart + 2, 18);
    const deliveryEnd = Math.min(deliveryStart + 2, 20);

    const fmt = (h: number) => `${h.toString().padStart(2, '0')}:00`;
    const dateFormatted = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

    return {
      pickupDate: dateFormatted,
      pickupTime: `${fmt(pickupStart)} - ${fmt(pickupEnd)}`,
      deliveryDate: dateFormatted,
      deliveryTime: `${fmt(deliveryStart)} - ${fmt(deliveryEnd)}`,
    };
  }, [selectedDate]);

  if (!windows || !selectedDate) return null;

  // Skrócone nazwy lokalizacji z adresów
  const pickupCity = extractCity(pickupAddress);
  const deliveryCity = extractCity(deliveryAddress);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pickup window */}
      <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-5">
        <h4 className="font-bold text-white text-sm mb-2">
          {vehicleCategory === 'lkw'
            ? `Abholung${pickupCity ? ` in ${pickupCity}` : ''}`
            : 'Früheste Abholung zwischen'
          }
        </h4>
        <p className="text-yellow-400 font-semibold">
          {windows.pickupDate} | <span className="text-lg">{windows.pickupTime}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Sie können die genaue Zeit in den nächsten Schritten festlegen
        </p>
      </div>

      {/* Delivery window */}
      <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-5">
        <h4 className="font-bold text-white text-sm mb-2">
          {vehicleCategory === 'lkw'
            ? `Zustellung${deliveryCity ? ` in ${deliveryCity}` : ''}`
            : 'Früheste Zustellung zwischen'
          }
        </h4>
        <p className="text-yellow-400 font-semibold">
          {windows.deliveryDate} | <span className="text-lg">{windows.deliveryTime}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Sie können die genaue Zeit in den nächsten Schritten festlegen
        </p>
      </div>
    </div>
  );
};

/** Wyciąga nazwę miasta z adresu (heurystyka) */
function extractCity(address: string): string {
  if (!address) return '';
  // Próbuj wyciągnąć po kodzie pocztowym lub ostatni segment
  const parts = address.split(/[,\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    // Szukaj czegoś co nie jest kodem pocztowym
    const city = parts.find((p) => p.length > 3 && !/^\d{2}-?\d{3}$/.test(p));
    return city || parts[parts.length - 1];
  }
  return address;
}
