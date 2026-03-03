/**
 * WizardLayout v3 — Steps 1-4 aktywne, 5-6 placeholder
 */

import { useCalculatorStoreV2 } from '../../store/calculatorStoreV2';
import { WIZARD_STEPS } from '../../types/calculator';
import { StepPreis } from './steps/StepPreis';
import { StepSendung } from './steps/StepSendung';
import { StepAbholung } from './steps/StepAbholung';
import { StepZustellung } from './steps/StepZustellung';
import { WizardSidebar } from './WizardSidebar';

export const WizardLayout = () => {
  const { currentStep, completedSteps, setStep, canNavigateTo } = useCalculatorStoreV2();

  const showSidebar = currentStep >= 2;

  return (
    <div className="min-h-screen text-white py-6 px-4" style={{ backgroundColor: '#1A1A1A' }}>
      <div className={`mx-auto ${showSidebar ? 'max-w-5xl' : 'max-w-3xl'}`}>

        {/* ── Step Indicator ── */}
        <div className="mb-8">
          <div className="hidden md:flex items-center justify-between mb-2 px-1">
            {WIZARD_STEPS.map(({ step, labelDE }) => {
              const s = step as 1|2|3|4|5|6;
              const isActive = currentStep === s;
              const isDone = completedSteps.has(s);
              const canClick = canNavigateTo(s);
              return (
                <button
                  key={step}
                  onClick={() => canClick && setStep(s)}
                  disabled={!canClick}
                  className={`
                    text-xs font-semibold transition-colors
                    ${isActive ? 'text-yellow-400'
                      : isDone ? 'text-green-400 cursor-pointer hover:text-green-300'
                      : canClick ? 'text-gray-500 cursor-pointer hover:text-gray-300'
                      : 'text-gray-700 cursor-not-allowed'}
                  `}
                >
                  {step}. {labelDE}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1.5">
            {WIZARD_STEPS.map(({ step }) => {
              const s = step as 1|2|3|4|5|6;
              return (
                <div
                  key={step}
                  className={`
                    flex-1 h-1.5 rounded-full transition-all duration-300
                    ${currentStep === s ? 'bg-yellow-400'
                      : completedSteps.has(s) ? 'bg-green-500'
                      : 'bg-gray-700'}
                  `}
                />
              );
            })}
          </div>

          <p className="md:hidden text-center text-xs text-gray-500 mt-2">
            Schritt {currentStep} von 6:{' '}
            <span className="text-yellow-400 font-semibold">
              {WIZARD_STEPS[currentStep - 1].labelDE}
            </span>
          </p>
        </div>

        {/* ── Content Area ── */}
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
            <div className="bg-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-800">
              <StepContent step={currentStep} />
            </div>
            <div className="hidden lg:block">
              <WizardSidebar />
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-800">
            <StepContent step={currentStep} />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-8 text-center text-xs text-gray-600 space-y-1">
          <p>PALMO-TRANS GmbH | Express & Sondertransporte</p>
          <p>* 0% USt. für Kunden außerhalb von Deutschland (Reverse Charge), nur für gewerbliche Kunden (USt.-ID notwendig)</p>
        </div>
      </div>
    </div>
  );
};

const StepContent = ({ step }: { step: number }) => {
  switch (step) {
    case 1: return <StepPreis />;
    case 2: return <StepSendung />;
    case 3: return <StepAbholung />;
    case 4: return <StepZustellung />;
    case 5: return <PlaceholderStep name="Rechnungsadresse" />;
    case 6: return <PlaceholderStep name="Zahlung" />;
    default: return null;
  }
};

const PlaceholderStep = ({ name }: { name: string }) => (
  <div className="text-center py-20">
    <p className="text-2xl font-bold text-gray-500">{name}</p>
    <p className="text-gray-600 mt-2">Wird in der nächsten Phase implementiert</p>
  </div>
);
