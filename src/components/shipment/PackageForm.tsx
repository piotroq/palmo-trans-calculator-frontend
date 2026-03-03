/**
 * PackageForm — Formularz pojedynczego Packstück
 *
 * Kategorie dropdown + Sendung (opis) + Anzahl (+/-) + Stapelbar toggle
 * + Gewicht + Länge + Breite + Höhe
 * Wzorowane na Zipmend: etykiety po lewej, inputy po prawej
 */

import type { Package } from '../../types/calculator';

interface PackageFormProps {
  pkg: Package;
  index: number;
  canDelete: boolean;
  errors: Record<string, string>;
  onUpdate: (data: Partial<Package>) => void;
  onDelete: () => void;
}

const CATEGORIES = [
  { id: 'CAT-PALETTE', label: 'Palette', icon: '📦' },
  { id: 'CAT-DOKUMENT', label: 'Dokument', icon: '📄' },
  { id: 'CAT-PAKET', label: 'Paket', icon: '📮' },
  { id: 'CAT-FAHRZEUG', label: 'Komplettes Fahrzeug', icon: '🚐' },
  { id: 'CAT-GITTERBOX', label: 'Euro Gitterbox', icon: '🔲' },
  { id: 'CAT-SONSTIGE', label: 'Sonstige', icon: '📋' },
];

// Domyślne wartości per kategoria
const CATEGORY_DEFAULTS: Record<string, { length: number; width: number; height: number; weight: number }> = {
  'CAT-PALETTE':   { length: 120, width: 80,  height: 100, weight: 100 },
  'CAT-DOKUMENT':  { length: 35,  width: 25,  height: 5,   weight: 1 },
  'CAT-PAKET':     { length: 60,  width: 40,  height: 40,  weight: 10 },
  'CAT-GITTERBOX': { length: 124, width: 83,  height: 97,  weight: 70 },
};

export const PackageForm = ({ pkg, index, canDelete, errors, onUpdate, onDelete }: PackageFormProps) => {
  const weightError = errors[`pkg-${pkg.id}-weight`];
  const dimsError = errors[`pkg-${pkg.id}-dims`];
  const qtyError = errors[`pkg-${pkg.id}-qty`];

  const handleCategoryChange = (categoryId: string) => {
    const defaults = CATEGORY_DEFAULTS[categoryId];
    onUpdate({
      categoryId,
      ...(defaults ? defaults : {}),
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-gray-700 p-5">
      {/* Header: Packstück N + Delete */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-white">Packstück {index + 1}</h3>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Packstück entfernen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs: Sendung | Verbotene Güter */}
      <div className="flex gap-6 mb-4 border-b border-gray-700 pb-2">
        <span className="text-sm font-semibold text-yellow-400 border-b-2 border-yellow-400 pb-2 -mb-2.5">
          Sendung
        </span>
        <a
          href="https://palmo-trans.com/verbotene-gueter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Verbotene Güter
        </a>
      </div>

      {/* ── Kategorie + Beschreibung ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Kategorie</label>
          <select
            value={pkg.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="
              w-full px-3 py-2.5 rounded-lg
              bg-gray-700 text-white text-sm
              border-2 border-gray-600
              focus:outline-none focus:border-yellow-400
              appearance-none cursor-pointer
            "
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sendung</label>
          <input
            type="text"
            value={pkg.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="z. B. Maschinenteile, Werkzeuge"
            className="
              w-full px-3 py-2.5 rounded-lg
              bg-gray-800 text-white text-sm placeholder-gray-500
              border-2 border-gray-600
              hover:border-gray-500 focus:border-yellow-400
              focus:outline-none transition-all
            "
          />
        </div>
      </div>

      {/* ── Anzahl + Stapelbar ── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormRow label="Anzahl" error={qtyError}>
          <div className="flex items-center">
            <button
              onClick={() => onUpdate({ quantity: Math.max(1, pkg.quantity - 1) })}
              className="w-9 h-9 rounded-l-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border-2 border-r-0 border-gray-600 transition-colors font-bold"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={pkg.quantity}
              onChange={(e) => onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 h-9 text-center bg-gray-800 text-white border-2 border-gray-600 focus:outline-none focus:border-yellow-400 text-sm"
            />
            <button
              onClick={() => onUpdate({ quantity: pkg.quantity + 1 })}
              className="w-9 h-9 rounded-r-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border-2 border-l-0 border-gray-600 transition-colors font-bold"
            >
              +
            </button>
          </div>
        </FormRow>

        <FormRow label="Stapelbar">
          <button
            onClick={() => onUpdate({ stackable: !pkg.stackable })}
            className={`
              relative w-12 h-6 rounded-full transition-all duration-200
              ${pkg.stackable ? 'bg-yellow-400' : 'bg-gray-600'}
            `}
          >
            <span
              className={`
                absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                ${pkg.stackable ? 'translate-x-6' : 'translate-x-0.5'}
              `}
            />
          </button>
        </FormRow>
      </div>

      {/* ── Gewicht ── */}
      <FormRow label="Gewicht" suffix="kg pro Packstück" error={weightError}>
        <DimensionInput
          value={pkg.weight}
          icon="⚖️"
          onChange={(v) => onUpdate({ weight: v })}
          hasError={!!weightError}
        />
      </FormRow>

      {/* ── Dimensions: Länge, Breite, Höhe ── */}
      <FormRow label="Länge" suffix="cm pro Packstück" error={dimsError && pkg.length <= 0 ? dimsError : undefined}>
        <DimensionInput
          value={pkg.length}
          icon="↔"
          onChange={(v) => onUpdate({ length: v })}
          hasError={!!dimsError && pkg.length <= 0}
        />
      </FormRow>

      <FormRow label="Breite" suffix="cm pro Packstück">
        <DimensionInput
          value={pkg.width}
          icon="↕"
          onChange={(v) => onUpdate({ width: v })}
          hasError={!!dimsError && pkg.width <= 0}
        />
      </FormRow>

      <FormRow label="Höhe" suffix="cm pro Packstück">
        <DimensionInput
          value={pkg.height}
          icon="⬍"
          onChange={(v) => onUpdate({ height: v })}
          hasError={!!dimsError && pkg.height <= 0}
        />
      </FormRow>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

interface FormRowProps {
  label: string;
  suffix?: string;
  error?: string;
  children: React.ReactNode;
}

const FormRow = ({ label, suffix, error, children }: FormRowProps) => (
  <div className="flex items-center gap-4 mb-3">
    <span className="text-sm text-gray-400 w-20 text-right flex-shrink-0">{label}</span>
    <div className="flex items-center gap-2 flex-1">
      {children}
      {suffix && <span className="text-xs text-gray-500 whitespace-nowrap">({suffix})</span>}
    </div>
    {error && <span className="text-xs text-red-400">❌</span>}
  </div>
);

interface DimensionInputProps {
  value: number;
  icon: string;
  onChange: (val: number) => void;
  hasError?: boolean;
}

const DimensionInput = ({ value, icon, onChange, hasError }: DimensionInputProps) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{icon}</span>
    <input
      type="number"
      min={0}
      step={1}
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`
        w-28 pl-9 pr-3 py-2 rounded-lg text-sm text-center
        bg-gray-800 text-white
        border-2 transition-all
        focus:outline-none
        ${hasError
          ? 'border-red-500 focus:border-red-400'
          : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'
        }
      `}
    />
    {!hasError && value > 0 && (
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
    )}
  </div>
);
