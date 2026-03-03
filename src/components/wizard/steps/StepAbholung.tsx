/**
 * Step 3: Abholung eingeben
 *
 * Pełny formularz adresu odbioru + Zeitfenster selector.
 * Wykorzystuje reusable FullAddressForm i TimeWindowSelector.
 */

import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { FullAddressForm } from '../../address/FullAddressForm';
import { TimeWindowSelector } from '../../scheduling/TimeWindowSelector';
import { StepNavigation } from '../../ui/StepNavigation';

export const StepAbholung = () => {
  const {
    pickupAddressFull,
    pickupSchedule,
    pickupAddress,
    errors,
    updatePickupAddressFull,
    updatePickupSchedule,
    setError,
    clearError,
    goNext,
    goBack,
    markStepCompleted,
  } = useCalculatorStoreV2();

  const handleNext = () => {
    let valid = true;

    if (!pickupAddressFull.firstName.trim()) {
      setError('pickup-firstName', 'Vorname ist erforderlich');
      valid = false;
    } else {
      clearError('pickup-firstName');
    }

    if (!pickupAddressFull.lastName.trim()) {
      setError('pickup-lastName', 'Nachname ist erforderlich');
      valid = false;
    } else {
      clearError('pickup-lastName');
    }

    if (!pickupAddressFull.street.trim()) {
      setError('pickup-street', 'Straße ist erforderlich');
      valid = false;
    } else {
      clearError('pickup-street');
    }

    if (!pickupAddressFull.postalCode.trim()) {
      setError('pickup-postalCode', 'PLZ ist erforderlich');
      valid = false;
    } else {
      clearError('pickup-postalCode');
    }

    if (!pickupAddressFull.phone.trim()) {
      setError('pickup-phone', 'Telefonnummer ist erforderlich');
      valid = false;
    } else {
      clearError('pickup-phone');
    }

    if (valid) {
      markStepCompleted(3);
      goNext();
    }
  };

  // Wyciągnij miasto z adresu z kroku 1
  const cityName = extractCity(pickupAddress);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Abholung eingeben</h2>

      <FullAddressForm
        data={pickupAddressFull}
        onChange={updatePickupAddressFull}
        errors={errors}
        errorPrefix="pickup"
        referenceLabel="Lade-Referenz"
      />

      <TimeWindowSelector
        type="pickup"
        schedule={pickupSchedule}
        onUpdate={updatePickupSchedule}
        cityName={cityName}
      />

      <StepNavigation
        onNext={handleNext}
        onBack={goBack}
        nextLabel="Weiter zur Zustellung"
        showBack={true}
      />
    </div>
  );
};

function extractCity(address: string): string {
  if (!address) return '';
  const parts = address.split(/[,\s]+/).filter(Boolean);
  const city = parts.find((p) => p.length > 3 && !/^\d{2}-?\d{3}$/.test(p));
  return city || '';
}
