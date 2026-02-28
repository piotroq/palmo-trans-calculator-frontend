import { useEffect } from 'react';
import { useCalculatorStore } from './store/calculatorStore';
import { WizardStep1 } from './components/WizardStep1';
import { WizardStep2 } from './components/WizardStep2';
import { WizardStep3 } from './components/WizardStep3';
import './App.css';

function App() {
  const { currentStep } = useCalculatorStore();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=PLN`;
    script.async = true;
    script.onload = () => {
      console.log('✅ PayPal SDK loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load PayPal SDK');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-white py-8 px-4" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-2xl mx-auto rounded-xl shadow-2xl p-8" style={{ backgroundColor: '#1F2937' }}>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition ${
                currentStep >= step ? 'bg-yellow-400' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {currentStep === 1 && <WizardStep1 />}
        {currentStep === 2 && <WizardStep2 />}
        {currentStep === 3 && <WizardStep3 />}

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>PALMO-TRANS GmbH | Kalkulator Express Deliveries</p>
          <p className="mt-2">Bezpieczne | Niezawodne | Profesjonalne</p>
        </div>
      </div>
    </div>
  );
}

export default App;
