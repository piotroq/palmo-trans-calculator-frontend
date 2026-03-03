/**
 * Step 6: Zahlung — Eingaben überprüfen + Zahlmethode wählen
 *
 * Lewa strona: pełne podsumowanie zamówienia (2 kolumny)
 * Prawa strona (sidebar): Jetzt buchen + payment methods
 */

import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { expressVehicles, lkwVehicles } from '../../vehicles/vehicleData';

const PAYMENT_METHODS = [
  { id: 'rechnung', label: 'Rechnung', sublabel: 'Nur gewerblich, 14 Tage Zahlungsziel', icon: '🧾' },
  { id: 'przelewy24', label: 'Przelewy24', sublabel: '', icon: '🏦' },
  { id: 'paypal', label: 'Paypal', sublabel: 'Transaktionskosten (+15,99 zł)', icon: '💳' },
  { id: 'kreditkarte', label: 'Kreditkarte', sublabel: '', icon: '💎' },
] as const;

const CATEGORY_MAP: Record<string, string> = {
  'CAT-PALETTE': 'Palette (EPAL)', 'CAT-DOKUMENT': 'Dokument', 'CAT-PAKET': 'Paket',
  'CAT-FAHRZEUG': 'Komplettes Fahrzeug', 'CAT-GITTERBOX': 'Euro Gitterbox', 'CAT-SONSTIGE': 'Sonstige',
};

const SERVICE_MAP: Record<string, string> = {
  'SVC-01': 'Beladehilfe durch Fahrer', 'SVC-02': 'Entladehilfe durch Fahrer',
  'SVC-03': 'Neutrale Abholung/Zustellung', 'SVC-04': 'Papierrechnung',
  'SVC-05': 'Beladung von oben', 'SVC-06': 'Hebebühne',
};

export const StepZahlung = () => {
  const {
    pickupAddressFull, deliveryAddressFull,
    pickupSchedule, deliverySchedule,
    pickupAddress, deliveryAddress,
    packages, additionalInfo,
    invoice, selectedServiceIds,
    vehicleId, vehicleCategory,
    distanceKm, pricing,
    paymentMethod, setPaymentMethod,
    setStep, errors, setError, clearError,
  } = useCalculatorStoreV2();

  const allVehicles = [...expressVehicles, ...lkwVehicles];
  const vehicle = allVehicles.find((v) => v.id === vehicleId);

  const totalWeight = packages.reduce((sum, p) => sum + p.weight * p.quantity, 0);

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2,'0')}.${(dt.getMonth()+1).toString().padStart(2,'0')}.${dt.getFullYear()}`;
  };

  const fmtPrice = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleBuy = () => {
    if (!paymentMethod) {
      setError('payment', 'Bitte Zahlmethode wählen');
      return;
    }
    clearError('payment');

    // TODO: Integracja z backendem POST /api/v2/booking
    alert(`Buchung wird erstellt...\nZahlmethode: ${paymentMethod}\nGesamtsumme: ${fmtPrice(pricing?.total ?? 0)} zł`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Eingaben überprüfen</h2>

      {/* ── Podsumowanie: 2 kolumny ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* === Lewa kolumna === */}
        <div className="space-y-6">
          {/* Abholung */}
          <SummarySection title="Abholung" onEdit={() => setStep(3)}>
            <AddressBlock data={pickupAddressFull} />
            <p className="text-xs text-gray-400 mt-2 font-semibold">Abholzeit:</p>
            <p className="text-sm text-gray-300">{fmtDate(pickupSchedule.date)}</p>
            <p className="text-sm text-yellow-400 font-semibold">
              {pickupSchedule.timeSlot ? `${pickupSchedule.timeSlot.from} - ${pickupSchedule.timeSlot.to}` : '08:00 - 14:00'} ✓
            </p>
          </SummarySection>

          {/* Sendung */}
          <SummarySection title="Sendung" onEdit={() => setStep(2)}>
            {packages.map((pkg, i) => (
              <div key={pkg.id} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-700' : ''}>
                <p className="text-sm text-gray-300">{pkg.quantity} x {CATEGORY_MAP[pkg.categoryId] || pkg.categoryId}</p>
                {pkg.description && <p className="text-xs text-gray-400">{pkg.description}</p>}
                <p className="text-xs text-gray-400">{pkg.length} x {pkg.width} x {pkg.height}cm</p>
                <p className="text-xs text-gray-400">pro Packstück: {pkg.weight} kg</p>
              </div>
            ))}
            <p className="text-sm text-gray-300 mt-2">Gesamtgewicht: {totalWeight.toLocaleString('de-DE')}kg</p>
            {additionalInfo && <p className="text-xs text-gray-400 mt-1">{additionalInfo}</p>}
          </SummarySection>

          {/* Zusatzservices */}
          <SummarySection title="Zusatzservices" onEdit={() => setStep(1)}>
            {selectedServiceIds.length > 0 ? (
              selectedServiceIds.map((id) => (
                <p key={id} className="text-sm text-gray-300">{SERVICE_MAP[id] || id}</p>
              ))
            ) : (
              <p className="text-xs text-gray-500">Kein Service ausgewählt</p>
            )}
          </SummarySection>

          {/* Zeitfenster */}
          <SummarySection title="Zeitfenster" onEdit={() => setStep(3)}>
            <p className="text-sm text-gray-300">
              ✅ Abhol-Zeitfenster {twLabel(pickupSchedule.timeWindowId)}
            </p>
            <p className="text-sm text-gray-300">
              ✅ Zustell-Zeitfenster {twLabel(deliverySchedule.timeWindowId)}
            </p>
          </SummarySection>

          {/* Preis */}
          <SummarySection title="Preis">
            <p className="text-sm text-gray-300">Entfernung: {distanceKm} km</p>
            <p className="text-sm text-gray-300">Fahrzeit: ~{Math.round(distanceKm / 60 * 60)} min</p>
          </SummarySection>
        </div>

        {/* === Prawa kolumna === */}
        <div className="space-y-6">
          {/* Zustellung */}
          <SummarySection title="Zustellung" onEdit={() => setStep(4)}>
            <AddressBlock data={deliveryAddressFull} />
            <p className="text-xs text-gray-400 mt-2 font-semibold">Zustellzeit:</p>
            <p className="text-sm text-gray-300">{fmtDate(deliverySchedule.date || pickupSchedule.date)}</p>
            <p className="text-sm text-yellow-400 font-semibold">
              {deliverySchedule.timeSlot ? `${deliverySchedule.timeSlot.from} - ${deliverySchedule.timeSlot.to}` : '10:00 - 16:00'} ✓
            </p>
          </SummarySection>

          {/* Rechnungsadresse */}
          <SummarySection title="Rechnungsadresse" onEdit={() => setStep(5)}>
            {invoice.company && <p className="text-sm text-gray-300 font-semibold">{invoice.company}</p>}
            <p className="text-sm text-gray-300">{invoice.firstName} {invoice.lastName}</p>
            <p className="text-sm text-gray-300">{invoice.street}</p>
            {invoice.addressExtra && <p className="text-sm text-gray-300">{invoice.addressExtra}</p>}
            <p className="text-sm text-gray-300">{invoice.country} {invoice.postalCode} {invoice.city}</p>
            <p className="text-sm text-gray-300">{invoice.phone}</p>
            {invoice.email && <p className="text-sm text-gray-300">{invoice.email}</p>}
            {invoice.vatId && <p className="text-sm text-gray-300">USt-ID/Steuernr.: {invoice.vatId}</p>}
            {invoice.reference && <p className="text-sm text-gray-300">Referenznummer: {invoice.reference}</p>}
          </SummarySection>

          {/* Fahrzeugtyp */}
          <SummarySection title="Fahrzeugtyp" onEdit={() => setStep(1)}>
            {vehicle && (
              <>
                <p className="text-sm text-gray-300 font-semibold">{vehicle.nameDE}</p>
                <p className="text-xs text-gray-400">
                  max. {vehicle.maxDimensions.length}x{vehicle.maxDimensions.width}x{vehicle.maxDimensions.height}cm
                </p>
                <p className="text-xs text-gray-400">max. {fmtWeight(vehicle.maxWeight)}</p>
                {vehicle.maxPallets && <p className="text-xs text-gray-400">max. {vehicle.maxWeight}kg pro Packstück</p>}
              </>
            )}
          </SummarySection>

          {/* Gesamtsumme */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Gesamtsumme</p>
            <p className="text-3xl font-bold text-yellow-400 text-right">
              {fmtPrice(pricing?.total ?? 0)} zł
            </p>
            <p className="text-xs text-gray-500 text-right">
              exkl. 0% MwSt. Brutto {fmtPrice(pricing?.total ?? 0)} zł zł
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Payment Sidebar (wyświetlany z WizardSidebar na Step 6) ──

export const PaymentPanel = () => {
  const { paymentMethod, setPaymentMethod, pricing, errors, setError, clearError } = useCalculatorStoreV2();

  const fmtPrice = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleBuy = () => {
    if (!paymentMethod) {
      setError('payment', 'Bitte Zahlmethode wählen');
      return;
    }
    clearError('payment');
    alert(`Buchung wird erstellt...\nZahlmethode: ${paymentMethod}\nGesamtsumme: ${fmtPrice(pricing?.total ?? 0)} zł`);
  };

  return (
    <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-5 sticky top-6">
      <h3 className="text-lg font-bold text-white mb-2">Jetzt buchen</h3>
      <p className="text-sm text-gray-400 mb-4">Zur Buchung <span className="font-semibold text-white">Zahlmethode wählen</span></p>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((pm) => {
          const isActive = paymentMethod === pm.id;
          return (
            <button
              key={pm.id}
              onClick={() => setPaymentMethod(pm.id as any)}
              className={`
                w-full flex items-center gap-3
                px-4 py-3 rounded-xl border-2 text-left
                transition-all duration-200
                ${isActive
                  ? 'border-yellow-400 bg-yellow-400/5'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }
              `}
            >
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isActive ? 'border-yellow-400' : 'border-gray-500'}
              `}>
                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />}
              </div>
              <span className="text-xl flex-shrink-0">{pm.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {pm.label}
                </p>
                {pm.sublabel && (
                  <p className="text-[10px] text-gray-500">{pm.sublabel}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {errors.payment && <p className="text-xs text-red-400 mt-2">❌ {errors.payment}</p>}

      {/* CTA */}
      <button
        onClick={handleBuy}
        className="
          w-full py-4 rounded-xl font-bold text-lg mt-5
          bg-yellow-400 text-gray-900
          hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20
          active:scale-[0.99] transition-all duration-200
        "
      >
        Jetzt kaufen
      </button>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
        Mit dem Klick auf den Button, versichern Sie, dass Sie die{' '}
        <a href="/agb" className="underline hover:text-gray-400">AGB</a>,{' '}
        <a href="/datenschutz" className="underline hover:text-gray-400">Datenschutzerklärung</a>{' '}
        und die <a href="/verbotene-gueter" className="underline hover:text-gray-400">Liste der verbotenen Güter</a>{' '}
        gelesen haben und diese akzeptieren.
      </p>

      <button className="text-xs text-gray-400 hover:text-yellow-400 underline underline-offset-2 mt-3 transition-colors">
        Bei Zahlungsproblemen hier klicken
      </button>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

const SummarySection = ({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-3 mb-2">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-gray-500 hover:text-yellow-400 underline underline-offset-2 transition-colors">
          Bearbeiten
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
);

const AddressBlock = ({ data }: { data: { company: string; firstName: string; lastName: string; street: string; addressExtra: string; country: string; postalCode: string; city: string; phone: string; reference: string; notes: string } }) => (
  <>
    {data.company && <p className="text-sm text-gray-300">{data.company}</p>}
    <p className="text-sm text-gray-300">{data.firstName} {data.lastName}</p>
    <p className="text-sm text-gray-300">{data.street}</p>
    {data.addressExtra && <p className="text-sm text-gray-300">{data.addressExtra}</p>}
    <p className="text-sm text-gray-300">{data.country} {data.postalCode} {data.city}</p>
    {data.phone && <p className="text-sm text-gray-300">{data.phone}</p>}
    {data.reference && <p className="text-sm text-gray-300">Referenznummer: {data.reference}</p>}
    {data.notes && <p className="text-xs text-gray-400 mt-1">{data.notes}</p>}
  </>
);

function fmtWeight(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(0)}t` : `${kg}kg`;
}

function twLabel(id: string): string {
  const map: Record<string, string> = { 'TW-6H': '6 h (0,00 zł)', 'TW-3H': '3 h (+413,82 zł)', 'TW-FIX': 'Fixzeit (+831,82 zł)' };
  return map[id] || id;
}
