/**
 * Step 2: Sendung eingeben
 *
 * Multi-package form: Kategorie, Beschreibung, Anzahl, Stapelbar,
 * Gewicht, Länge, Breite, Höhe per Packstück.
 * + "Weitere Sendung" button + "Weitere Infos" textarea
 */

import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { PackageForm } from '../../shipment/PackageForm';
import { StepNavigation } from '../../ui/StepNavigation';
import type { Package } from '../../../types/calculator';

export const StepSendung = () => {
  const {
    packages,
    additionalInfo,
    vehicleId,
    addPackage,
    removePackage,
    updatePackage,
    setAdditionalInfo,
    setError,
    clearError,
    errors,
    goNext,
    goBack,
    markStepCompleted,
  } = useCalculatorStoreV2();

  // Jeśli brak pakietów, dodaj domyślny
  if (packages.length === 0) {
    handleAddPackage();
  }

  function handleAddPackage() {
    const newPkg: Package = {
      id: crypto.randomUUID(),
      categoryId: 'CAT-PALETTE',
      description: '',
      quantity: 1,
      stackable: false,
      weight: 100,
      length: 120,
      width: 80,
      height: 100,
    };
    addPackage(newPkg);
  }

  function handleRemovePackage(id: string) {
    if (packages.length <= 1) return; // min. 1 paczka
    removePackage(id);
  }

  // Walidacja przed przejściem do kroku 3
  function handleNext() {
    let valid = true;

    for (const pkg of packages) {
      if (pkg.weight <= 0) {
        setError(`pkg-${pkg.id}-weight`, 'Gewicht muss größer als 0 sein');
        valid = false;
      } else {
        clearError(`pkg-${pkg.id}-weight`);
      }

      if (pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
        setError(`pkg-${pkg.id}-dims`, 'Alle Maße müssen größer als 0 sein');
        valid = false;
      } else {
        clearError(`pkg-${pkg.id}-dims`);
      }

      if (pkg.quantity < 1) {
        setError(`pkg-${pkg.id}-qty`, 'Mindestens 1 Packstück');
        valid = false;
      } else {
        clearError(`pkg-${pkg.id}-qty`);
      }
    }

    if (valid) {
      markStepCompleted(2);
      goNext();
    }
  }

  // Gesamtgewicht
  const totalWeight = packages.reduce((sum, p) => sum + p.weight * p.quantity, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Sendung eingeben</h2>

      {/* ── Package Forms ── */}
      {packages.map((pkg, index) => (
        <PackageForm
          key={pkg.id}
          pkg={pkg}
          index={index}
          canDelete={packages.length > 1}
          errors={errors}
          onUpdate={(data) => updatePackage(pkg.id, data)}
          onDelete={() => handleRemovePackage(pkg.id)}
        />
      ))}

      {/* ── Add Package ── */}
      <div className="flex justify-end">
        <button
          onClick={handleAddPackage}
          className="
            px-5 py-2.5 rounded-lg
            bg-gray-700 text-gray-300 text-sm font-medium
            border-2 border-gray-600
            hover:bg-gray-600 hover:text-white hover:border-gray-500
            transition-all duration-200
          "
        >
          + Weitere Sendung
        </button>
      </div>

      {/* ── Total Weight ── */}
      <div className="text-right text-sm text-gray-400">
        Gesamtgewicht:{' '}
        <span className="text-white font-semibold">{totalWeight.toLocaleString('de-DE')} kg</span>
      </div>

      {/* ── Weitere Infos ── */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Weitere Infos
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="z. B. Maschinenteile, Werkzeuge, besondere Hinweise..."
          rows={4}
          className="
            w-full px-4 py-3 rounded-lg
            bg-gray-800 text-white placeholder-gray-500
            border-2 border-gray-600
            hover:border-gray-500 focus:border-yellow-400
            focus:outline-none transition-all duration-200
            resize-none
          "
        />
      </div>

      {/* ── Navigation ── */}
      <StepNavigation
        onNext={handleNext}
        onBack={goBack}
        nextLabel="Weiter zur Abholung"
        showBack={true}
      />
    </div>
  );
};
