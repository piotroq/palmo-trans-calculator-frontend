/**
 * WizardSidebar — Übersicht (podsumowanie zamówienia)
 *
 * Pojawia się od kroku 2. Pokazuje dane z poprzednich kroków.
 * Sekcje: Abholung, Zustellung, Sendung, Zusatzservices, Fahrzeugtyp, Gesamtsumme
 * Każda sekcja z "Bearbeiten" linkiem wracającym do odpowiedniego kroku.
 */

import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import { StepNavigation } from '../ui/StepNavigation';
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
    currentStep,
    pickupAddress,
    deliveryAddress,
    pickupSchedule,
    deliverySchedule,
    vehicleId,
    vehicleCategory,
    selectedServiceIds,
    packages,
    additionalInfo,
    pricing,
    setStep,
    goNext,
  } = useCalculatorStoreV2();

  // Znajdź pojazd
  const allVehicles = [...expressVehicles, ...lkwVehicles];
  const vehicle = allVehicles.find((v) => v.id === vehicleId);

  // Formatuj datę
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  // Gesamtgewicht
  const totalWeight = packages.reduce((sum, p) => sum + p.weight * p.quantity, 0);

  const formattedPrice = pricing?.total
    ? pricing.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  // Typ CTA na górze sidebara zależy od aktualnego kroku
  const ctaLabels: Record<number, string> = {
    2: 'Weiter zur Abholung',
    3: 'Weiter zur Zustellung',
    4: 'Weiter zur Rechnungsadresse',
    5: 'Weiter zur Zahlung',
    6: 'Jetzt buchen',
  };

  return (
    <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-5 sticky top-6">
      {/* CTA na górze */}
      <button
        onClick={goNext}
        className="
          w-full py-3 rounded-xl font-bold text-sm mb-6
          bg-yellow-400 text-gray-900
          hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20
          active:scale-[0.99] transition-all duration-200
        "
      >
        {ctaLabels[currentStep] || 'Weiter'}
      </button>

      <h3 className="text-lg font-bold text-white mb-5">Übersicht</h3>

      {/* ── Abholung ── */}
      <SidebarSection title="Abholung" step={1} onEdit={() => setStep(1)}>
        <p className="text-sm text-gray-300">{pickupAddress || '—'}</p>
        {pickupSchedule.date && (
          <>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Abholzeit:</p>
            <p className="text-sm text-gray-300">{formatDate(pickupSchedule.date)}</p>
            <p className="text-sm text-yellow-400 font-semibold">08:00 - 14:00 ✓</p>
          </>
        )}
      </SidebarSection>

      {/* ── Zustellung ── */}
      <SidebarSection title="Zustellung" step={1} onEdit={() => setStep(1)}>
        <p className="text-sm text-gray-300">{deliveryAddress || '—'}</p>
        {deliverySchedule.date && (
          <>
            <p className="text-xs text-gray-400 mt-1 font-semibold">Zustellzeit:</p>
            <p className="text-sm text-gray-300">{formatDate(deliverySchedule.date)}</p>
          </>
        )}
      </SidebarSection>

      {/* ── Sendung ── */}
      {packages.length > 0 && (
        <SidebarSection title="Sendung" step={2} onEdit={() => setStep(2)}>
          {packages.map((pkg, i) => {
            const catLabel = getCategoryLabel(pkg.categoryId);
            return (
              <div key={pkg.id} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-700' : ''}>
                <p className="text-sm text-gray-300">
                  {pkg.quantity} x {catLabel}
                </p>
                {pkg.description && (
                  <p className="text-xs text-gray-400">{pkg.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {pkg.length} x {pkg.width} x {pkg.height}cm
                </p>
                <p className="text-xs text-gray-400">
                  pro Packstück: {pkg.weight}kg
                </p>
              </div>
            );
          })}
          <p className="text-sm text-gray-300 mt-2 font-semibold">
            Gesamtgewicht: {totalWeight.toLocaleString('de-DE')}kg
          </p>
          {additionalInfo && (
            <p className="text-xs text-gray-400 mt-1">{additionalInfo}</p>
          )}
        </SidebarSection>
      )}

      {/* ── Zusatzservices ── */}
      <SidebarSection title="Zusatzservices" step={1} onEdit={() => setStep(1)}>
        {selectedServiceIds.length > 0 ? (
          <ul className="space-y-1">
            {selectedServiceIds.map((id) => (
              <li key={id} className="text-xs text-gray-300">
                {ALL_SERVICES_MAP[id] || id}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">Kein Service ausgewählt</p>
        )}
      </SidebarSection>

      {/* ── Fahrzeugtyp ── */}
      {vehicle && (
        <SidebarSection title="Fahrzeugtyp" step={1} onEdit={() => setStep(1)}>
          <p className="text-sm text-gray-300">
            {vehicle.nameDE}
            {vehicle.maxPallets ? ` - bis ${vehicle.maxPallets} EPAL` : ''}
          </p>
          <p className="text-xs text-gray-400">
            (max. {vehicle.maxDimensions.length / 100}m x {vehicle.maxDimensions.width / 100}m x {vehicle.maxDimensions.height / 100}m, max. {formatWeight(vehicle.maxWeight)})
          </p>
        </SidebarSection>
      )}

      {/* ── Gesamtsumme ── */}
      <div className="mt-5 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">Gesamtsumme</p>
        <p className="text-2xl font-bold text-yellow-400 text-right">{formattedPrice} zł</p>
        <p className="text-xs text-gray-500 text-right mt-1">
          exkl. 0% MwSt. Brutto {formattedPrice} zł zł *
        </p>
      </div>

      {/* ── Reverse Charge Note ── */}
      <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
        * 0% USt. für Kunden außerhalb von Deutschland (Reverse Charge), nur für gewerbliche Kunden (USt.-ID notwendig)
      </p>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

interface SidebarSectionProps {
  title: string;
  step: number;
  onEdit: () => void;
  children: React.ReactNode;
}

const SidebarSection = ({ title, step, onEdit, children }: SidebarSectionProps) => (
  <div className="mb-4 pb-4 border-b border-gray-800">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <button
        onClick={onEdit}
        className="text-xs text-gray-500 hover:text-yellow-400 underline underline-offset-2 transition-colors"
      >
        Bearbeiten
      </button>
    </div>
    {children}
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────

function getCategoryLabel(categoryId: string): string {
  const map: Record<string, string> = {
    'CAT-PALETTE': 'Palette (EPAL)',
    'CAT-DOKUMENT': 'Dokument',
    'CAT-PAKET': 'Paket',
    'CAT-FAHRZEUG': 'Komplettes Fahrzeug',
    'CAT-GITTERBOX': 'Euro Gitterbox',
    'CAT-SONSTIGE': 'Sonstige',
  };
  return map[categoryId] || categoryId;
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(0)}t`;
  return `${kg}kg`;
}
