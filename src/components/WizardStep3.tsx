import { useEffect } from 'react';
import { useCalculatorStore } from '../store/calculatorStore';
import { calculateRoute } from '../services/googleMaps';
import { submitDeliveryRequest } from '../services/api';

export const WizardStep3 = () => {
  const {
    formData,
    updateFormData,
    setStep,
    setLoading,
    isLoading,
    resetForm,
    errors,
    setError,
  } = useCalculatorStore();

  // Auto-calculate price on mount
  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculatePrice = async () => {
    if (!formData.pickupCoords || !formData.deliveryCoords || !formData.weight || !formData.serviceType) {
      return;
    }

    try {
      setLoading(true);
      const route = await calculateRoute(
        formData.pickupCoords,
        formData.deliveryCoords,
        formData.weight,
        formData.serviceType
      );

      let totalCost = route.cost;

      if (formData.additionalServices?.insurance) {
        totalCost *= 1.05;
      }
      if (formData.additionalServices?.signatureRequired) {
        totalCost *= 1.03;
      }

      updateFormData({
        estimatedDistance: route.distance,
        estimatedDuration: route.duration,
        estimatedPrice: Math.round(totalCost * 100) / 100,
      });
    } catch (error) {
      setError('price', error instanceof Error ? error.message : 'Błąd obliczania ceny');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Walidacja
    if (!formData.contactEmail?.trim()) {
      setError('contactEmail', 'Wpisz email');
      return;
    }
    if (!formData.contactPhone?.trim()) {
      setError('contactPhone', 'Wpisz telefon');
      return;
    }

    try {
      setLoading(true);
      const response = await submitDeliveryRequest(formData);

      // Sukces!
      alert(
        `✅ Zgłoszenie przyjęte!\n\nNumer referencyjny: ${response.referenceNumber}\n\nSprawdzmy wiadomość email.`
      );

      // Reset formularza
      resetForm();
    } catch (error) {
      setError(
        'submit',
        error instanceof Error ? error.message : 'Błąd wysyłania'
      );
    } finally {
      setLoading(false);
    }
  };

  const distanceKm = formData.estimatedDistance
    ? (formData.estimatedDistance / 1000).toFixed(1)
    : '—';
  const durationHours = formData.estimatedDuration
    ? (formData.estimatedDuration / 3600).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Krok 3: Podsumowanie & Płatność</h2>
        <p className="text-gray-400">Przejrzyj szczegóły i wyślij zgłoszenie</p>
      </div>

      {/* Summary Box */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold mb-4">Szczegóły Przesyłki</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">📍 Pobranie:</span>
            <span className="font-semibold">{formData.pickupAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">📍 Dostawa:</span>
            <span className="font-semibold">{formData.deliveryAddress}</span>
          </div>

          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-gray-400">📦 Waga:</span>
              <span>{formData.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">📏 Dystans:</span>
              <span>{distanceKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">⏱️ Czas:</span>
              <span>~{durationHours} godzin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">📦 Typ:</span>
              <span className="uppercase">
                {formData.serviceType === 'express' ? '⚡ Express' : '🚚 Standard'}
              </span>
            </div>
          </div>

          {(formData.additionalServices?.insurance ||
            formData.additionalServices?.signatureRequired) && (
            <div className="border-t border-gray-700 pt-3 mt-3">
              {formData.additionalServices?.insurance && (
                <div className="text-blue-300">🛡️ Ubezpieczenie</div>
              )}
              {formData.additionalServices?.signatureRequired && (
                <div className="text-blue-300">✍️ Podpis wymagany</div>
              )}
            </div>
          )}

          <div className="border-t border-yellow-400 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Cena:</span>
              <span className="text-3xl font-bold text-yellow-400">
                {formData.estimatedPrice?.toFixed(2)} zł
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Twoje Dane Kontaktowe</h3>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={formData.contactEmail || ''}
            onChange={(e) => {
              updateFormData({ contactEmail: e.target.value });
              setError('contactEmail', '');
            }}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-gray-800 text-white border-2
              focus:outline-none focus:border-yellow-400
              ${errors.contactEmail ? 'border-red-500' : 'border-gray-700'}
            `}
          />
          {errors.contactEmail && (
            <p className="text-xs text-red-500 mt-1">❌ {errors.contactEmail}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold mb-2">
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+48 123 456 789"
            value={formData.contactPhone || ''}
            onChange={(e) => {
              updateFormData({ contactPhone: e.target.value });
              setError('contactPhone', '');
            }}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-gray-800 text-white border-2
              focus:outline-none focus:border-yellow-400
              ${errors.contactPhone ? 'border-red-500' : 'border-gray-700'}
            `}
          />
          {errors.contactPhone && (
            <p className="text-xs text-red-500 mt-1">❌ {errors.contactPhone}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold mb-2">
            Notatki (opcjonalnie)
          </label>
          <textarea
            id="notes"
            placeholder="Dodatkowe informacje o przesyłce..."
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`
          w-full py-4 px-4 rounded-lg font-bold text-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-yellow-400
          ${
            isLoading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
          }
        `}
      >
        {isLoading ? '⏳ Przetwarzanie...' : '💳 Wyślij Zgłoszenie'}
      </button>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-lg font-bold
            bg-gray-700 hover:bg-gray-600 text-white
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Wstecz
        </button>
      </div>
    </div>
  );
};
