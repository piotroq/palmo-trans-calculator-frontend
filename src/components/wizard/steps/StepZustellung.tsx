/**
 * Step 4: Zustellung eingeben
 *
 * Formularz adresu dostawy + Zeitfenster selector.
 * Identyczna struktura jak StepAbholung, różne labels i store fields.
 */

import { useCalculatorStoreV2 } from '../../../store/calculatorStoreV2';
import { FullAddressForm } from '../../address/FullAddressForm';
import { TimeWindowSelector } from '../../scheduling/TimeWindowSelector';
import { StepNavigation } from '../../ui/StepNavigation';

export const StepZustellung = () => {
  const {
    deliveryAddressFull,
    deliverySchedule,
    deliveryAddress,
    errors,
    updateDeliveryAddressFull,
    updateDeliverySchedule,
    setError,
    clearError,
    goNext,
    goBack,
    markStepCompleted,
  } = useCalculatorStoreV2();

  const handleNext = () => {
    let valid = true;

    if (!deliveryAddressFull.firstName.trim()) {
      setError('delivery-firstName', 'Vorname ist erforderlich');
      valid = false;
    } else {
      clearError('delivery-firstName');
    }

    if (!deliveryAddressFull.lastName.trim()) {
      setError('delivery-lastName', 'Nachname ist erforderlich');
      valid = false;
    } else {
      clearError('delivery-lastName');
    }

    if (!deliveryAddressFull.street.trim()) {
      setError('delivery-street', 'Straße ist erforderlich');
      valid = false;
    } else {
      clearError('delivery-street');
    }

    if (!deliveryAddressFull.postalCode.trim()) {
      setError('delivery-postalCode', 'PLZ ist erforderlich');
      valid = false;
    } else {
      clearError('delivery-postalCode');
    }

    if (!deliveryAddressFull.phone.trim()) {
      setError('delivery-phone', 'Telefonnummer ist erforderlich');
      valid = false;
    } else {
      clearError('delivery-phone');
    }

    if (valid) {
      markStepCompleted(4);
      goNext();
    }
  };

  const cityName = extractCity(deliveryAddress);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Zustellung eingeben</h2>

      <FullAddressForm
        data={deliveryAddressFull}
        onChange={updateDeliveryAddressFull}
        errors={errors}
        errorPrefix="delivery"
        referenceLabel="Zustell-Referenz"
      />

      <TimeWindowSelector
        type="delivery"
        schedule={deliverySchedule}
        onUpdate={updateDeliverySchedule}
        cityName={cityName}
      />

      <StepNavigation
        onNext={handleNext}
        onBack={goBack}
        nextLabel="Weiter zur Rechnungsadresse"
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
