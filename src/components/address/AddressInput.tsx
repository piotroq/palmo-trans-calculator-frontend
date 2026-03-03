/**
 * AddressInput — Pole adresu z geocodowaniem
 *
 * Wzorowane na Zipmend: [PL ▼] [55-100 Trzebnica ✓]
 * Po wpisaniu i zatwierdzeniu (Enter/blur) geocoduje adres.
 */

import { useState, useRef } from 'react';
import { geocodeAddress } from '../../services/apiV2';
import type { Coordinates } from '../../types/calculator';

interface AddressInputProps {
  label: string;
  value: string;
  coords: Coordinates | null;
  error?: string;
  onChange: (address: string, coords?: Coordinates) => void;
}

const COUNTRIES = [
  { code: 'PL', name: 'Polen' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'AT', name: 'Österreich' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'SK', name: 'Slowakei' },
];

export const AddressInput = ({ label, value, coords, error, onChange }: AddressInputProps) => {
  const [country, setCountry] = useState('PL');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGeocode = async () => {
    const trimmed = value.trim();
    if (!trimmed || coords) return; // już zgeokodowany lub pusty

    setIsGeocoding(true);
    setGeocodeError('');
    try {
      const fullAddress = `${trimmed}, ${country}`;
      const result = await geocodeAddress(fullAddress);
      onChange(trimmed, result);
    } catch (err) {
      setGeocodeError(err instanceof Error ? err.message : 'Geocoding fehlgeschlagen');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGeocode();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeocodeError('');
    onChange(e.target.value); // reset coords (no second arg)
  };

  const isVerified = !!coords;
  const displayError = error || geocodeError;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="flex gap-0">
        {/* Country selector */}
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            if (coords) onChange(value); // reset coords on country change
          }}
          className="
            w-20 px-2 py-3 rounded-l-lg
            bg-gray-700 text-white text-sm font-semibold
            border-2 border-r-0 border-gray-600
            focus:outline-none focus:border-yellow-400
            appearance-none cursor-pointer
          "
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>

        {/* Address input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={`PLZ oder Stadt (${label})`}
            value={value}
            onChange={handleChange}
            onBlur={handleGeocode}
            onKeyDown={handleKeyDown}
            disabled={isGeocoding}
            className={`
              w-full px-4 py-3 rounded-r-lg
              bg-gray-800 text-white placeholder-gray-500
              border-2 transition-all duration-200
              focus:outline-none
              ${displayError
                ? 'border-red-500 focus:border-red-400'
                : isVerified
                  ? 'border-green-500 focus:border-green-400'
                  : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'
              }
              ${isGeocoding ? 'opacity-70' : ''}
            `}
          />

          {/* Status icon */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
            {isGeocoding ? (
              <span className="animate-spin inline-block">⏳</span>
            ) : isVerified ? (
              <span className="text-green-400">✓</span>
            ) : null}
          </span>
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-xs text-red-400 mt-1">❌ {displayError}</p>
      )}
    </div>
  );
};
