import { useCalculatorStore } from '../store/calculatorStore';

export const WizardStep2 = () => {
  const { formData, updateFormData, setStep, errors, setError } =
    useCalculatorStore();

  const handleNext = () => {
    if (!formData.weight || formData.weight <= 0) {
      setError('weight', 'Wpisz wagę przesyłki');
      return;
    }

    if (!formData.serviceType) {
      setError('serviceType', 'Wybierz typ usługi');
      return;
    }

    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Krok 2: Szczegóły Przesyłki</h2>
        <p className="text-gray-400">
          Określ wagę i rodzaj usługi dostawy
        </p>
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-semibold mb-2">
          Waga Przesyłki (kg) <span className="text-red-500">*</span>
        </label>
        <input
          id="weight"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="np. 15"
          value={formData.weight || ''}
          onChange={(e) => {
            updateFormData({ weight: parseFloat(e.target.value) });
            if (e.target.value) {
              setError('weight', '');
            }
          }}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-gray-800 text-white
            border-2 transition-colors
            focus:outline-none focus:border-yellow-400
            ${
              errors.weight
                ? 'border-red-500'
                : 'border-gray-700 hover:border-gray-600'
            }
          `}
        />
        {errors.weight && (
          <p className="text-xs text-red-500 mt-2">❌ {errors.weight}</p>
        )}
      </div>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Typ Usługi <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {[
            {
              value: 'standard',
              label: 'Standard (24-48h)',
              icon: '🚚',
              color: 'border-blue-500',
            },
            {
              value: 'express',
              label: 'Express (4-8h) — +50%',
              icon: '⚡',
              color: 'border-orange-500',
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center p-4 rounded-lg cursor-pointer
                border-2 transition-colors
                ${
                  formData.serviceType === option.value
                    ? `${option.color} bg-gray-700`
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }
              `}
            >
              <input
                type="radio"
                name="serviceType"
                value={option.value}
                checked={formData.serviceType === option.value}
                onChange={(e) =>
                  updateFormData({
                    serviceType: e.target.value as 'standard' | 'express',
                  })
                }
                className="w-4 h-4 cursor-pointer"
              />
              <span className="ml-3">
                {option.icon} <strong>{option.label}</strong>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-sm font-semibold mb-3">Usługi Dodatkowe</h3>
        <div className="space-y-2">
          {[
            { id: 'insurance', label: 'Ubezpieczenie przesyłki (+5%)', icon: '🛡️' },
            { id: 'signatureRequired', label: 'Wymaganie podpisu (+3%)', icon: '✍️' },
          ].map((service) => (
            <label key={service.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  formData.additionalServices?.[
                    service.id as keyof typeof formData.additionalServices
                  ] || false
                }
                onChange={(e) =>
                  updateFormData({
                    additionalServices: {
                      insurance: formData.additionalServices?.insurance || false,
                      signatureRequired: formData.additionalServices?.signatureRequired || false,
                      timeSlot: formData.additionalServices?.timeSlot || false,
                      [service.id]: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="ml-3">
                {service.icon} {service.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-4 rounded-lg font-bold
            bg-gray-700 hover:bg-gray-600 text-white
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          ← Wstecz
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-lg font-bold text-lg
            bg-yellow-400 hover:bg-yellow-500 text-black
            transition-colors duration-200 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-yellow-600"
        >
          Dalej →
        </button>
      </div>
    </div>
  );
};
