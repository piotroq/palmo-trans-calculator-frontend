/**
 * WizardSidebar — Übersicht (Steps 2-5, na Step 6 zastępuje go PaymentPanel)
 */

import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import { expressVehicles, lkwVehicles } from '../vehicles/vehicleData';

const ALL_SERVICES_MAP: Record<string, string> = {
  'SVC-01': 'Beladehilfe durch Fahrer (+119,00 zł)',
  'SVC-02': 'Entladehilfe durch Fahrer (+119,00 zł)',
  'SVC-03': 'Neutrale Abholung/Zustellung (+499,00 zł)',
  'SVC-04': 'Papierrechnung (+49,99 zł)',
  'SVC-05': 'Beladung von oben (+399,00 zł)',
  'SVC-06': 'Hebebühne (+619,00 zł)',
};

export const WizardSidebar = () => {
  const {
    currentStep, pickupAddress, deliveryAddress,
    pickupSchedule, deliverySchedule,
    pickupAddressFull, deliveryAddressFull,
    vehicleId, selectedServiceIds,
    packages, additionalInfo, pricing, invoice,
    setStep, goNext,
  } = useCalculatorStoreV2();

  const allVehicles = [...expressVehicles, ...lkwVehicles];
  const vehicle = allVehicles.find((v) => v.id === vehicleId);

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2,'0')}.${(dt.getMonth()+1).toString().padStart(2,'0')}.${dt.getFullYear()}`;
  };

  const fmtPrice = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalWeight = packages.reduce((sum, p) => sum + p.weight * p.quantity, 0);

  const ctaLabels: Record<number, string> = {
    2: 'Weiter zur Abholung',
    3: 'Weiter zur Zustellung',
    4: 'Weiter zur Rechnungsadresse',
    5: 'Weiter zur Zahlung',
  };

  return (
    <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-5 sticky top-6">
      {/* CTA */}
      <button onClick={goNext} className="w-full py-3 rounded-xl font-bold text-sm mb-6 bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 active:scale-[0.99] transition-all duration-200">
        {ctaLabels[currentStep] || 'Weiter'}
      </button>

      <h3 className="text-lg font-bold text-white mb-5">Übersicht</h3>

      {/* Abholung */}
      <Section title="Abholung" onEdit={() => setStep(currentStep >= 3 ? 3 : 1)}>
        {currentStep >= 3 && pickupAddressFull.firstName ? (
          <>
            {pickupAddressFull.company && <p className="text-sm text-gray-300">{pickupAddressFull.company}</p>}
            <p className="text-sm text-gray-300">{pickupAddressFull.firstName} {pickupAddressFull.lastName}</p>
            <p className="text-sm text-gray-300">{pickupAddressFull.street}</p>
            <p className="text-sm text-gray-300">{pickupAddressFull.country} {pickupAddressFull.postalCode} {pickupAddressFull.city}</p>
            {pickupAddressFull.phone && <p className="text-sm text-gray-300">{pickupAddressFull.phone}</p>}
          </>
        ) : (
          <p className="text-sm text-gray-300">{pickupAddress || '—'}</p>
        )}
        {pickupSchedule.date && (
          <>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Abholzeit:</p>
            <p className="text-sm text-gray-300">{fmtDate(pickupSchedule.date)}</p>
            <p className="text-sm text-yellow-400 font-semibold">
              {pickupSchedule.timeSlot ? `${pickupSchedule.timeSlot.from} - ${pickupSchedule.timeSlot.to}` : '08:00 - 14:00'} ✓
            </p>
          </>
        )}
      </Section>

      {/* Zustellung */}
      <Section title="Zustellung" onEdit={() => setStep(currentStep >= 4 ? 4 : 1)}>
        {currentStep >= 4 && deliveryAddressFull.firstName ? (
          <>
            {deliveryAddressFull.company && <p className="text-sm text-gray-300">{deliveryAddressFull.company}</p>}
            <p className="text-sm text-gray-300">{deliveryAddressFull.firstName} {deliveryAddressFull.lastName}</p>
            <p className="text-sm text-gray-300">{deliveryAddressFull.street}</p>
            <p className="text-sm text-gray-300">{deliveryAddressFull.country} {deliveryAddressFull.postalCode} {deliveryAddressFull.city}</p>
          </>
        ) : (
          <p className="text-sm text-gray-300">{deliveryAddress || '—'}</p>
        )}
        {deliverySchedule.date && (
          <>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Zustellzeit:</p>
            <p className="text-sm text-yellow-400 font-semibold">
              {deliverySchedule.timeSlot ? `${deliverySchedule.timeSlot.from} - ${deliverySchedule.timeSlot.to}` : '10:00 - 16:00'} ✓
            </p>
          </>
        )}
      </Section>

      {/* Sendung */}
      {packages.length > 0 && (
        <Section title="Sendung" onEdit={() => setStep(2)}>
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-700' : ''}>
              <p className="text-sm text-gray-300">{pkg.quantity} x {getCatLabel(pkg.categoryId)}</p>
              {pkg.description && <p className="text-xs text-gray-400">{pkg.description}</p>}
              <p className="text-xs text-gray-400">{pkg.length} x {pkg.width} x {pkg.height}cm</p>
              <p className="text-xs text-gray-400">pro Packstück: {pkg.weight}kg</p>
            </div>
          ))}
          <p className="text-sm text-gray-300 mt-2 font-semibold">Gesamtgewicht: {totalWeight.toLocaleString('de-DE')}kg</p>
        </Section>
      )}

      {/* Rechnungsadresse (od step 5+) */}
      {currentStep >= 5 && invoice.firstName && (
        <Section title="Rechnungsadresse" onEdit={() => setStep(5)}>
          {invoice.company && <p className="text-sm text-gray-300 font-semibold">{invoice.company}</p>}
          <p className="text-sm text-gray-300">{invoice.firstName} {invoice.lastName}</p>
          <p className="text-sm text-gray-300">{invoice.street}</p>
          <p className="text-sm text-gray-300">{invoice.country} {invoice.postalCode} {invoice.city}</p>
          {invoice.email && <p className="text-sm text-gray-300">{invoice.email}</p>}
        </Section>
      )}

      {/* Zusatzservices */}
      <Section title="Zusatzservices" onEdit={() => setStep(1)}>
        {selectedServiceIds.length > 0 ? (
          selectedServiceIds.map((id) => <p key={id} className="text-xs text-gray-300">{ALL_SERVICES_MAP[id] || id}</p>)
        ) : (
          <p className="text-xs text-gray-500">Kein Service ausgewählt</p>
        )}
      </Section>

      {/* Fahrzeugtyp */}
      {vehicle && (
        <Section title="Fahrzeugtyp" onEdit={() => setStep(1)}>
          <p className="text-sm text-gray-300">{vehicle.nameDE}</p>
          <p className="text-xs text-gray-400">
            max. {vehicle.maxDimensions.length / 100}m x {vehicle.maxDimensions.width / 100}m x {vehicle.maxDimensions.height / 100}m, max. {fmtWeight(vehicle.maxWeight)}
          </p>
        </Section>
      )}

      {/* Gesamtsumme */}
      <div className="mt-5 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">Gesamtsumme</p>
        <p className="text-2xl font-bold text-yellow-400 text-right">{fmtPrice(pricing?.total ?? 0)} zł</p>
        <p className="text-xs text-gray-500 text-right mt-1">exkl. 0% MwSt. Brutto {fmtPrice(pricing?.total ?? 0)} zł zł *</p>
      </div>

      <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
        * 0% USt. für Kunden außerhalb von Deutschland (Reverse Charge), nur für gewerbliche Kunden (USt.-ID notwendig)
      </p>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────

const Section = ({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) => (
  <div className="mb-4 pb-4 border-b border-gray-800">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      {onEdit && <button onClick={onEdit} className="text-xs text-gray-500 hover:text-yellow-400 underline underline-offset-2 transition-colors">Bearbeiten</button>}
    </div>
    {children}
  </div>
);

function getCatLabel(id: string): string {
  const map: Record<string, string> = {
    'CAT-PALETTE': 'Palette (EPAL)', 'CAT-DOKUMENT': 'Dokument', 'CAT-PAKET': 'Paket',
    'CAT-FAHRZEUG': 'Fahrzeug', 'CAT-GITTERBOX': 'Euro Gitterbox', 'CAT-SONSTIGE': 'Sonstige',
  };
  return map[id] || id;
}

function fmtWeight(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(0)}t` : `${kg}kg`;
}
