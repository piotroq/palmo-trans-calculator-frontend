/**
 * TimeWindowSelector — Zeitfenster auswählen
 *
 * Radio buttons: 6 Stunden (Kostenlos) | 3 Stunden (+413,82 zł) | Fixzeit (+831,82 zł)
 * + lista dostępnych slotów po prawej (np. 08:00-14:00, 09:00-15:00)
 * Dopłaty time window dotyczą tylko Express. LKW = Kostenlos.
 */

import { useMemo } from 'react';
import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import type { ScheduleData } from '../../types/calculator';

interface TimeWindowSelectorProps {
  /** 'pickup' | 'delivery' */
  type: 'pickup' | 'delivery';
  schedule: ScheduleData;
  onUpdate: (data: Partial<ScheduleData>) => void;
  /** Nazwa miasta, np. "Trzebnica" */
  cityName: string;
}

interface TimeWindowOption {
  id: string;
  label: string;
  surchargeExpress: number;
  surchargeLkw: number;
}

const TIME_WINDOWS: TimeWindowOption[] = [
  { id: 'TW-6H', label: '6 Stunden', surchargeExpress: 0, surchargeLkw: 0 },
  { id: 'TW-3H', label: '3 Stunden', surchargeExpress: 413.82, surchargeLkw: 0 },
  { id: 'TW-FIX', label: 'Fixzeit', surchargeExpress: 831.82, surchargeLkw: 0 },
];

export const TimeWindowSelector = ({ type, schedule, onUpdate, cityName }: TimeWindowSelectorProps) => {
  const { vehicleCategory, pickupSchedule } = useCalculatorStoreV2();

  const selectedDate = schedule.date || pickupSchedule.date;
  const selectedTW = schedule.timeWindowId || 'TW-6H';

  // Formatuj datę
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === d.toDateString();

    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();

    if (isToday) return `Heute ${dd}.${mm}.${yyyy}`;
    if (isTomorrow) return `Morgen ${dd}.${mm}.${yyyy}`;
    return `${dd}.${mm}.${yyyy}`;
  }, [selectedDate]);

  // Generuj sloty na podstawie window
  const slots = useMemo(() => {
    if (!selectedDate) return [];

    const d = new Date(selectedDate);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    let startHour = isToday ? Math.max(now.getHours() + 2, 8) : 8;

    // Delivery ma offset +2h od pickup
    if (type === 'delivery') {
      startHour = Math.min(startHour + 2, 16);
    }

    const windowHours = selectedTW === 'TW-6H' ? 6 : selectedTW === 'TW-3H' ? 3 : 1;
    const result: { from: string; to: string }[] = [];

    for (let h = startHour; h <= 18 - windowHours; h++) {
      const from = `${h.toString().padStart(2, '0')}:00`;
      const to = `${(h + windowHours).toString().padStart(2, '0')}:00`;
      result.push({ from, to });
      if (result.length >= 3) break; // max 3 sloty widoczne
    }

    return result;
  }, [selectedDate, selectedTW, type]);

  const selectedSlot = schedule.timeSlot;

  const title = type === 'pickup'
    ? `Abholung${cityName ? ` in ${cityName}` : ''}`
    : `Zustellung${cityName ? ` in ${cityName}` : ''}`;

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-5 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-white">{title}</h4>
        <span className="text-sm text-gray-400">{formattedDate}</span>
      </div>

      <p className="text-sm text-gray-400 mb-3">Zeitfenster auswählen</p>

      <div className="grid grid-cols-1 sm:grid-cols-[200px,1fr] gap-4">
        {/* ── Time Window Radio Buttons ── */}
        <div className="space-y-2">
          {TIME_WINDOWS.map((tw) => {
            const isActive = selectedTW === tw.id;
            const surcharge = vehicleCategory === 'express'
              ? tw.surchargeExpress
              : tw.surchargeLkw;
            const surchargeLabel = surcharge > 0
              ? `+${surcharge.toLocaleString('de-DE', { minimumFractionDigits: 2 })} zł`
              : 'Kostenlos';

            return (
              <button
                key={tw.id}
                onClick={() => onUpdate({ timeWindowId: tw.id, timeSlot: undefined })}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-2.5 rounded-lg border-2 text-sm
                  transition-all duration-200
                  ${isActive
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {/* Radio circle */}
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${isActive ? 'border-yellow-400' : 'border-gray-500'}
                  `}>
                    {isActive && <div className="w-2 h-2 rounded-full bg-yellow-400" />}
                  </div>
                  <span className={isActive ? 'text-white font-medium' : 'text-gray-300'}>
                    {tw.label}
                  </span>
                </div>
                <span className={`text-xs ${surcharge > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {surchargeLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Time Slots ── */}
        <div className="space-y-2">
          {slots.map((slot, i) => {
            const isSelected = selectedSlot?.from === slot.from && selectedSlot?.to === slot.to;
            return (
              <button
                key={i}
                onClick={() => onUpdate({ timeSlot: slot })}
                className={`
                  w-full px-4 py-2.5 rounded-lg text-sm font-medium text-center
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400'
                    : i === 0 && !selectedSlot
                      ? 'bg-gray-700 text-white border-2 border-gray-600'
                      : 'bg-transparent text-gray-400 border-2 border-transparent hover:text-white'
                  }
                `}
              >
                {slot.from}-{slot.to}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
