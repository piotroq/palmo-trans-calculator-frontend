/**
 * FullAddressForm — Reusable formularz adresu
 *
 * Używany w Step 3 (Abholung) i Step 4 (Zustellung).
 * Pola: Firma, Vorname/Nachname, Straße+Hausnr, Adresszusatz,
 * PLZ/Ort (z country selector), Telefonnummer, Referenz, Anmerkungen
 */

import type { AddressData } from '../../types/calculator';

interface FullAddressFormProps {
  data: AddressData;
  onChange: (data: Partial<AddressData>) => void;
  errors: Record<string, string>;
  /** Prefix dla error keys, np. 'pickup' lub 'delivery' */
  errorPrefix: string;
  /** Label kontekstowe, np. 'Lade-Referenz' vs 'Zustell-Referenz' */
  referenceLabel: string;
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
  { code: 'CH', name: 'Schweiz' },
];

export const FullAddressForm = ({
  data,
  onChange,
  errors,
  errorPrefix,
  referenceLabel,
}: FullAddressFormProps) => {

  const err = (field: string) => errors[`${errorPrefix}-${field}`];

  return (
    <div className="space-y-4">
      {/* ── Firma ── */}
      <FormField label="Firma" error={err('company')}>
        <TextInput
          value={data.company}
          placeholder="Firmenname (optional)"
          onChange={(v) => onChange({ company: v })}
          hasError={!!err('company')}
        />
      </FormField>

      {/* ── Vorname + Nachname ── */}
      <FormField label="Vorname" error={err('firstName') || err('lastName')}>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
          <TextInput
            value={data.firstName}
            placeholder="Vorname"
            onChange={(v) => onChange({ firstName: v })}
            hasError={!!err('firstName')}
            required
          />
          <span className="text-gray-500 text-xs">Nachname</span>
          <TextInput
            value={data.lastName}
            placeholder="Nachname"
            onChange={(v) => onChange({ lastName: v })}
            hasError={!!err('lastName')}
            required
          />
        </div>
      </FormField>

      {/* ── Straße + Hausnr. ── */}
      <FormField label="Straße + Hausnr." error={err('street')}>
        <TextInput
          value={data.street}
          placeholder="Straße und Hausnummer"
          onChange={(v) => onChange({ street: v })}
          hasError={!!err('street')}
          required
        />
      </FormField>

      {/* ── Adresszusatz ── */}
      <FormField label="Adresszusatz">
        <TextInput
          value={data.addressExtra}
          placeholder="Etage, Gebäude, Tor, etc. (optional)"
          onChange={(v) => onChange({ addressExtra: v })}
        />
      </FormField>

      {/* ── Postleitzahl / Ort ── */}
      <FormField label="Postleitzahl / Ort" error={err('postalCode') || err('city')}>
        <div className="flex gap-0">
          <select
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="
              w-20 px-2 py-2.5 rounded-l-lg text-sm font-semibold
              bg-gray-700 text-white
              border-2 border-r-0 border-gray-600
              focus:outline-none focus:border-yellow-400
              appearance-none cursor-pointer
            "
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
          <input
            type="text"
            value={`${data.postalCode}${data.city ? ' ' + data.city : ''}`}
            onChange={(e) => {
              const val = e.target.value;
              // Rozdziel PLZ i miasto (np. "55-100 Trzebnica")
              const match = val.match(/^(\S+)\s*(.*)$/);
              if (match) {
                onChange({ postalCode: match[1], city: match[2] });
              } else {
                onChange({ postalCode: val, city: '' });
              }
            }}
            placeholder="PLZ Stadt"
            className={`
              flex-1 px-3 py-2.5 rounded-r-lg text-sm
              bg-gray-800 text-white placeholder-gray-500
              border-2 transition-all
              focus:outline-none
              ${err('postalCode') || err('city')
                ? 'border-red-500 focus:border-red-400'
                : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'
              }
            `}
          />
        </div>
      </FormField>

      {/* ── Telefonnummer ── */}
      <FormField label="Telefonnummer" error={err('phone')}>
        <TextInput
          value={data.phone}
          placeholder="+49 123 456 789"
          onChange={(v) => onChange({ phone: v })}
          hasError={!!err('phone')}
          required
          type="tel"
        />
      </FormField>

      {/* ── Referenz ── */}
      <FormField label={referenceLabel}>
        <TextInput
          value={data.reference}
          placeholder="Referenznummer (optional)"
          onChange={(v) => onChange({ reference: v })}
        />
      </FormField>

      {/* ── Anmerkungen ── */}
      <FormField label="Anmerkungen">
        <TextInput
          value={data.notes}
          placeholder="Besondere Hinweise (optional)"
          onChange={(v) => onChange({ notes: v })}
        />
      </FormField>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex items-start gap-4">
    <label className="text-sm text-gray-400 w-36 text-right pt-2.5 flex-shrink-0">
      {label}
    </label>
    <div className="flex-1">
      {children}
      {error && <p className="text-xs text-red-400 mt-1">❌ {error}</p>}
    </div>
  </div>
);

interface TextInputProps {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  hasError?: boolean;
  required?: boolean;
  type?: string;
}

const TextInput = ({ value, placeholder, onChange, hasError, required, type = 'text' }: TextInputProps) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2.5 rounded-lg text-sm
        bg-gray-800 text-white placeholder-gray-500
        border-2 transition-all
        focus:outline-none
        ${hasError
          ? 'border-red-500 focus:border-red-400'
          : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'
        }
      `}
    />
    {!hasError && value.trim() && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
    )}
  </div>
);
