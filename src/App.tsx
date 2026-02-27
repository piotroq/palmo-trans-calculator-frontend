import { useCalculatorStore } from './store/calculatorStore';
import './App.css';

function App() {
  const { currentStep } = useCalculatorStore();

  return (
    <div className="min-h-screen bg-palmo-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl p-8">
        {/* Progress Bar */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition ${
                currentStep >= step
                  ? 'bg-palmo-yellow'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-palmo-yellow mb-2">
            📦 Kalkulator Dostawy
          </h1>
          <p className="text-gray-400">
            Krok {currentStep} z 3
          </p>
        </div>

        {/* Placeholder */}
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-400 mb-4">
            ⏳ Komponenty wizarda są w przygotowaniu...
          </p>
          <p className="text-sm text-gray-500">
            Struktura projektu gotowa! ✓
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>PALMO-TRANS GmbH | Kalkulator Express Deliveries</p>
        </div>
      </div>
    </div>
  );
}

export default App;
