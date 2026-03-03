/**
 * Step 5: Rechnungsadresse eingeben
 *
 * Radio: "wie Abholung" / "wie Zustellung" / "Sonstige"
 * + pełny formularz adresu + E-Mail, Anrede, USt-ID, Rechnungs-E-Mail
 * + "Lade-Referenz kopieren" / "Zustell-Referenz kopieren"
 */

import { useState, useEffect } from 'react';
import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { StepNavigation } from '../../ui/StepNavigation';

type InvoiceSource = 'pickup' | 'delivery' | 'custom';

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

export const StepRechnung = () => {
  const {
    invoice,
    pickupAddressFull,
    deliveryAddressFull,
    errors,
    updateInvoice,
    setError,
    clearError,
    goNext,
    goBack,
    markStepCompleted,
  } = useCalculatorStoreV2();

  const [source, setSource] = useState<InvoiceSource>('custom');

  // Kopiuj dane z Abholung/Zustellung
  useEffect(() => {
    if (source === 'pickup') {
      updateInvoice({
        company: pickupAddressFull.company,
        firstName: pickupAddressFull.firstName,
        lastName: pickupAddressFull.lastName,
        street: pickupAddressFull.street,
        addressExtra: pickupAddressFull.addressExtra,
        country: pickupAddressFull.country,
        postalCode: pickupAddressFull.postalCode,
        city: pickupAddressFull.city,
        phone: pickupAddressFull.phone,
      });
    } else if (source === 'delivery') {
      updateInvoice({
        company: deliveryAddressFull.company,
        firstName: deliveryAddressFull.firstName,
        lastName: deliveryAddressFull.lastName,
        street: deliveryAddressFull.street,
        addressExtra: deliveryAddressFull.addressExtra,
        country: deliveryAddressFull.country,
        postalCode: deliveryAddressFull.postalCode,
        city: deliveryAddressFull.city,
        phone: deliveryAddressFull.phone,
      });
    }
  }, [source]);

  const handleNext = () => {
    let valid = true;

    if (!invoice.email.trim() || !invoice.email.includes('@')) {
      setError('inv-email', 'Gültige E-Mail-Adresse erforderlich');
      valid = false;
    } else { clearError('inv-email'); }

    if (!invoice.firstName.trim()) {
      setError('inv-firstName', 'Vorname ist erforderlich');
      valid = false;
    } else { clearError('inv-firstName'); }

    if (!invoice.lastName.trim()) {
      setError('inv-lastName', 'Nachname ist erforderlich');
      valid = false;
    } else { clearError('inv-lastName'); }

    if (!invoice.street.trim()) {
      setError('inv-street', 'Straße ist erforderlich');
      valid = false;
    } else { clearError('inv-street'); }

    if (!invoice.postalCode.trim()) {
      setError('inv-postalCode', 'PLZ ist erforderlich');
      valid = false;
    } else { clearError('inv-postalCode'); }

    if (!invoice.phone.trim()) {
      setError('inv-phone', 'Telefonnummer ist erforderlich');
      valid = false;
    } else { clearError('inv-phone'); }

    if (valid) {
      markStepCompleted(5);
      goNext();
    }
  };

  const err = (field: string) => errors[`inv-${field}`];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Rechnungsadresse eingeben</h2>

      {/* ── Source Radio ── */}
      <div className="space-y-2">
        {([
          { id: 'pickup' as InvoiceSource, label: 'wie Abholung' },
          { id: 'delivery' as InvoiceSource, label: 'wie Zustellung' },
          { id: 'custom' as InvoiceSource, label: 'Sonstige' },
        ]).map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${source === opt.id ? 'border-yellow-400' : 'border-gray-500 group-hover:border-gray-400'}
            `}>
              {source === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />}
            </div>
            <span className={source === opt.id ? 'text-white font-medium' : 'text-gray-400'}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {/* ── Invoice Form ── */}
      <div className="space-y-4">
        {/* E-Mail */}
        <FormField label="E-Mail" error={err('email')}>
          <TextInput value={invoice.email} placeholder="ihre@email.de"
            onChange={(v) => updateInvoice({ email: v })} hasError={!!err('email')} />
        </FormField>

        {/* Firma */}
        <FormField label="Firma">
          <TextInput value={invoice.company} placeholder="Firmenname (optional)"
            onChange={(v) => updateInvoice({ company: v })} />
        </FormField>

        {/* Anrede */}
        <FormField label="Anrede">
          <div className="flex gap-4">
            {(['Herr', 'Frau'] as const).map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer">
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${invoice.salutation === a ? 'border-yellow-400' : 'border-gray-500'}
                `}>
                  {invoice.salutation === a && <div className="w-2 h-2 rounded-full bg-yellow-400" />}
                </div>
                <span className="text-sm text-gray-300">{a}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Vorname + Nachname */}
        <FormField label="Vorname" error={err('firstName') || err('lastName')}>
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <TextInput value={invoice.firstName} placeholder="Vorname"
              onChange={(v) => updateInvoice({ firstName: v })} hasError={!!err('firstName')} />
            <span className="text-gray-500 text-xs">Nachname</span>
            <TextInput value={invoice.lastName} placeholder="Nachname"
              onChange={(v) => updateInvoice({ lastName: v })} hasError={!!err('lastName')} />
          </div>
        </FormField>

        {/* Straße + Hausnr. */}
        <FormField label="Straße + Hausnr." error={err('street')}>
          <TextInput value={invoice.street} placeholder="Straße und Hausnummer"
            onChange={(v) => updateInvoice({ street: v })} hasError={!!err('street')} />
        </FormField>

        {/* Adresszusatz */}
        <FormField label="Adresszusatz">
          <TextInput value={invoice.addressExtra} placeholder="Etage, Gebäude (optional)"
            onChange={(v) => updateInvoice({ addressExtra: v })} />
        </FormField>

        {/* Postleitzahl / Ort */}
        <FormField label="Postleitzahl / Ort" error={err('postalCode')}>
          <div className="flex gap-0">
            <select value={invoice.country}
              onChange={(e) => updateInvoice({ country: e.target.value })}
              className="w-20 px-2 py-2.5 rounded-l-lg text-sm font-semibold bg-gray-700 text-white border-2 border-r-0 border-gray-600 focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer"
            >
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <input type="text"
              value={`${invoice.postalCode}${invoice.city ? ' ' + invoice.city : ''}`}
              onChange={(e) => {
                const m = e.target.value.match(/^(\S+)\s*(.*)$/);
                if (m) updateInvoice({ postalCode: m[1], city: m[2] });
                else updateInvoice({ postalCode: e.target.value, city: '' });
              }}
              placeholder="PLZ Stadt"
              className={`flex-1 px-3 py-2.5 rounded-r-lg text-sm bg-gray-800 text-white placeholder-gray-500 border-2 transition-all focus:outline-none ${err('postalCode') ? 'border-red-500' : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'}`}
            />
          </div>
        </FormField>

        {/* Telefonnummer */}
        <FormField label="Telefonnummer" error={err('phone')}>
          <TextInput value={invoice.phone} placeholder="+49 123 456 789"
            onChange={(v) => updateInvoice({ phone: v })} hasError={!!err('phone')} type="tel" />
        </FormField>

        {/* Referenz Abrechnung */}
        <FormField label="Referenz Abrechnung">
          <TextInput value={invoice.reference} placeholder="Referenznummer (optional)"
            onChange={(v) => updateInvoice({ reference: v })} />
          <div className="flex gap-4 mt-1">
            <button onClick={() => updateInvoice({ reference: pickupAddressFull.reference })}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline underline-offset-2">
              Lade-Referenz kopieren
            </button>
            <button onClick={() => updateInvoice({ reference: deliveryAddressFull.reference })}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline underline-offset-2">
              Zustell-Referenz kopieren
            </button>
          </div>
        </FormField>

        {/* USt-ID/Steuernr. */}
        <FormField label="USt-ID/Steuernr.">
          <TextInput value={invoice.vatId} placeholder="z. B. PL1234567890"
            onChange={(v) => updateInvoice({ vatId: v })} />
          <p className="text-[10px] text-gray-500 mt-1">
            Für Reverse Charge (0% USt.) muss eine gültige USt-ID angegeben werden
          </p>
        </FormField>

        {/* Rechnungs-E-Mail */}
        <FormField label="Rechnungs-E-Mail">
          <TextInput value={invoice.billingEmail}
            placeholder="Falls abweichend von E-Mail (optional)"
            onChange={(v) => updateInvoice({ billingEmail: v })} type="email" />
        </FormField>
      </div>

      <StepNavigation
        onNext={handleNext}
        onBack={goBack}
        nextLabel="Weiter zur Zahlung"
        showBack={true}
      />
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <label className="text-sm text-gray-400 w-36 text-right pt-2.5 flex-shrink-0">{label}</label>
    <div className="flex-1">
      {children}
      {error && <p className="text-xs text-red-400 mt-1">❌ {error}</p>}
    </div>
  </div>
);

const TextInput = ({ value, placeholder, onChange, hasError, type = 'text' }: {
  value: string; placeholder: string; onChange: (v: string) => void; hasError?: boolean; type?: string;
}) => (
  <div className="relative">
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full px-3 py-2.5 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 border-2 transition-all focus:outline-none ${hasError ? 'border-red-500 focus:border-red-400' : 'border-gray-600 hover:border-gray-500 focus:border-yellow-400'}`} />
    {!hasError && value.trim() && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>}
  </div>
);
