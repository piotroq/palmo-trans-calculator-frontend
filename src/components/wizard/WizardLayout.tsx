/**
 * WizardLayout — Layout 6-krokowego wizarda
 *
 * Step indicator bar + aktualny krok + footer
 */

import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import { WIZARD_STEPS } from '../../types/calculator';
import { StepPreis } from './steps/StepPreis';

export const WizardLayout = () => {
  const { currentStep, completedSteps, setStep, canNavigateTo } = useCalculatorStoreV2();

  return (
    <div className="min-h-screen text-white py-6 px-4" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-3xl mx-auto">

        {/* ── Step Indicator ── */}
        <div className="mb-8">
          {/* Step labels (desktop) */}
          <div className="hidden md:flex items-center justify-between mb-2 px-1">
            {WIZARD_STEPS.map(({ step, labelDE }) => {
              const isActive = currentStep === step;
              const isDone = completedSteps.has(step as 1|2|3|4|5|6);
              const canClick = canNavigateTo(step as 1|2|3|4|5|6);

              return (
                <button
                  key={step}
                  onClick={() => canClick && setStep(step as 1|2|3|4|5|6)}
                  disabled={!canClick}
                  className={`
                    text-xs font-semibold transition-colors
                    ${isActive
                      ? 'text-yellow-400'
                      : isDone
                        ? 'text-green-400 cursor-pointer hover:text-green-300'
                        : canClick
                          ? 'text-gray-500 cursor-pointer hover:text-gray-300'
                          : 'text-gray-700 cursor-not-allowed'
                    }
                  `}
                >
                  {step}. {labelDE}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5">
            {WIZARD_STEPS.map(({ step }) => {
              const isActive = currentStep === step;
              const isDone = completedSteps.has(step as 1|2|3|4|5|6);
              return (
                <div
                  key={step}
                  className={`
                    flex-1 h-1.5 rounded-full transition-all duration-300
                    ${isActive
                      ? 'bg-yellow-400'
                      : isDone
                        ? 'bg-green-500'
                        : 'bg-gray-700'
                    }
                  `}
                />
              );
            })}
          </div>

          {/* Mobile: current step label */}
          <p className="md:hidden text-center text-xs text-gray-500 mt-2">
            Schritt {currentStep} von 6:{' '}
            <span className="text-yellow-400 font-semibold">
              {WIZARD_STEPS[currentStep - 1].labelDE}
            </span>
          </p>
        </div>

        {/* ── Step Content ── */}
        <div className="bg-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-800">
          {currentStep === 1 && <StepPreis />}
          {currentStep === 2 && <PlaceholderStep name="Sendung" />}
          {currentStep === 3 && <PlaceholderStep name="Abholung" />}
          {currentStep === 4 && <PlaceholderStep name="Zustellung" />}
          {currentStep === 5 && <PlaceholderStep name="Rechnungsadresse" />}
          {currentStep === 6 && <PlaceholderStep name="Zahlung" />}
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center text-xs text-gray-600 space-y-1">
          <p>PALMO-TRANS GmbH | Express & Sondertransporte</p>
          <p>* 0% USt. für Kunden außerhalb von Deutschland (Reverse Charge), nur für gewerbliche Kunden (USt.-ID notwendig)</p>
        </div>
      </div>
    </div>
  );
};

// Tymczasowy placeholder dla kroków 2-6
const PlaceholderStep = ({ name }: { name: string }) => (
  <div className="text-center py-20">
    <p className="text-2xl font-bold text-gray-500">{name}</p>
    <p className="text-gray-600 mt-2">Wird in der nächsten Phase implementiert</p>
  </div>
);
