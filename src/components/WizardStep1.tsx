import { useState } from 'react';
import { useCalculatorStore } from '../store/calculatorStore';
import { geocodeAddress } from '../services/googleMaps';
import type { Coordinates } from '../types/index';

export const WizardStep1 = () => {
  const {
    formData,
    updateFormData,
    setError,
    clearError,
    errors,
    setStep,
    setLoading,
    isLoading,
  } = useCalculatorStore();

  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);

  const handleGeocodeAddress = async (
    address: string,
    fieldType: 'pickup' | 'delivery'
  ) => {
    if (!address.trim()) {
      setError(
        fieldType === 'pickup' ? 'pickupAddress' : 'deliveryAddress',
        'Pole wymagane'
      );
      return;
    }

    try {
      const setterFunc =
        fieldType === 'pickup'
          ? setIsGeocodingPickup
          : setIsGeocodingDelivery;

      setterFunc(true);
      clearError(
        fieldType === 'pickup' ? 'pickupAddress' : 'deliveryAddress'
      );

      const coords = await geocodeAddress(address);

      const coordsField =
        fieldType === 'pickup' ? 'pickupCoords' : 'deliveryCoords';

      updateFormData({
        [coordsField]: coords,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Nie można geocodować adresu';

      setError(
        fieldType === 'pickup' ? 'pickupAddress' : 'deliveryAddress',
        errorMsg
      );
    } finally {
      const setterFunc =
        fieldType === 'pickup'
          ? setIsGeocodingPickup
          : setIsGeocodingDelivery;
      setterFunc(false);
    }
  };

  const handlePickupBlur = async () => {
    if (formData.pickupAddress) {
      await handleGeocodeAddress(
        formData.pickupAddress,
        'pickup'
      );
    }
  };

  const handleDeliveryBlur = async () => {
    if (formData.deliveryAddress) {
      await handleGeocodeAddress(
        formData.deliveryAddress,
        'delivery'
      );
    }
  };

  const handleNext = async () => {
    // Walidacja
    if (!formData.pickupAddress?.trim()) {
      setError('pickupAddress', 'Wpisz adres pobrania');
      return;
    }

    if (!formData.deliveryAddress?.trim()) {
      setError('deliveryAddress', 'Wpisz adres dostawy');
      return;
    }

    if (!formData.pickupCoords) {
      setError('pickupAddress', 'Adres pobrania jest niedostępny');
      return;
    }

    if (!formData.deliveryCoords) {
      setError('deliveryAddress', 'Adres dostawy jest niedostępny');
      return;
    }

    // Wszystko OK → przejdź do kroku 2
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Krok 1: Adresy Dostawy</h2>
        <p className="text-gray-400">
          Podaj adresy pobrania i dostawy przesyłki
        </p>
      </div>

      {/* Pickup Address */}
      <div>
        <label htmlFor="pickupAddress" className="block text-sm font-semibold mb-2">
          Adres Pobrania <span className="text-red-500">*</span>
        </label>
        <input
          id="pickupAddress"
          type="text"
          placeholder="np. Warszawska 123, 14482 Berlin, Deutschland"
          value={formData.pickupAddress || ''}
          onChange={(e) => {
            updateFormData({ pickupAddress: e.target.value });
            clearError('pickupAddress');
          }}
          onBlur={handlePickupBlur}
          disabled={isLoading}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-gray-800 text-white
            border-2 transition-colors
            focus:outline-none focus:border-yellow-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              errors.pickupAddress
                ? 'border-red-500'
                : 'border-gray-700 hover:border-gray-600'
            }
          `}
        />
        {isGeocodingPickup && (
          <p className="text-xs text-yellow-400 mt-2">⏳ Sprawdzam adres...</p>
        )}
        {formData.pickupCoords && !isGeocodingPickup && (
          <p className="text-xs text-green-400 mt-2">
            ✓ Adres znaleziony ({formData.pickupCoords.lat.toFixed(4)}, {formData.pickupCoords.lng.toFixed(4)})
          </p>
        )}
        {errors.pickupAddress && (
          <p className="text-xs text-red-500 mt-2">❌ {errors.pickupAddress}</p>
        )}
      </div>

      {/* Delivery Address */}
      <div>
        <label htmlFor="deliveryAddress" className="block text-sm font-semibold mb-2">
          Adres Dostawy <span className="text-red-500">*</span>
        </label>
        <input
          id="deliveryAddress"
          type="text"
          placeholder="np. Marienburger Str. 456, 00-130 Warszawa, Polska"
          value={formData.deliveryAddress || ''}
          onChange={(e) => {
            updateFormData({ deliveryAddress: e.target.value });
            clearError('deliveryAddress');
          }}
          onBlur={handleDeliveryBlur}
          disabled={isLoading}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-gray-800 text-white
            border-2 transition-colors
            focus:outline-none focus:border-yellow-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              errors.deliveryAddress
                ? 'border-red-500'
                : 'border-gray-700 hover:border-gray-600'
            }
          `}
        />
        {isGeocodingDelivery && (
          <p className="text-xs text-yellow-400 mt-2">⏳ Sprawdzam adres...</p>
        )}
        {formData.deliveryCoords && !isGeocodingDelivery && (
          <p className="text-xs text-green-400 mt-2">
            ✓ Adres znaleziony ({formData.deliveryCoords.lat.toFixed(4)}, {formData.deliveryCoords.lng.toFixed(4)})
          </p>
        )}
        {errors.deliveryAddress && (
          <p className="text-xs text-red-500 mt-2">
            ❌ {errors.deliveryAddress}
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> Adresy będą geocodowane automatycznie po
          opuszczeniu pola. Upewnij się, że są prawidłowe.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={handleNext}
          disabled={isLoading || isGeocodingPickup || isGeocodingDelivery}
          className={`
            flex-1 py-3 px-4 rounded-lg font-bold text-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-yellow-400 focus:ring-offset-gray-900
            ${
              isLoading ||
              isGeocodingPickup ||
              isGeocodingDelivery
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-black hover:bg-yellow-500 active:scale-95'
            }
          `}
        >
          {isGeocodingPickup || isGeocodingDelivery ? '⏳ Sprawdzam...' : 'Dalej →'}
        </button>
      </div>
    </div>
  );
};
