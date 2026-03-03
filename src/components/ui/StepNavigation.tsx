/**
 * StepNavigation — Przyciski nawigacji wizarda
 *
 * "Weiter zur Sendung" (CTA) + opcjonalnie "Zurück"
 * + link "Diesen Transport als Angebot zusenden"
 */

interface StepNavigationProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  disabled?: boolean;
}

export const StepNavigation = ({
  onNext,
  onBack,
  nextLabel = 'Weiter',
  backLabel = 'Zurück',
  showBack = true,
  disabled = false,
}: StepNavigationProps) => {
  return (
    <div className="space-y-4">
      {/* CTA Button */}
      <button
        onClick={onNext}
        disabled={disabled}
        className={`
          w-full py-4 rounded-xl font-bold text-lg
          transition-all duration-200
          ${disabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 active:scale-[0.99]'
          }
        `}
      >
        {nextLabel}
      </button>

      {/* Secondary actions */}
      <div className="flex items-center justify-between">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← {backLabel}
          </button>
        ) : (
          <div />
        )}

        <button
          className="text-sm text-gray-400 hover:text-yellow-400 underline underline-offset-2 transition-colors"
        >
          Diesen Transport als Angebot zusenden
        </button>
      </div>
    </div>
  );
};
