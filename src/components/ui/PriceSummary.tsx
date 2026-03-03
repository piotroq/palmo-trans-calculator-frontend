/**
 * PriceSummary — Podsumowanie ceny (Gesamtsumme)
 *
 * Wyświetla cenę netto + info o VAT.
 * Animacja przy przeliczaniu.
 */

interface PriceSummaryProps {
  total: number;
  isCalculating: boolean;
  vatRate?: number;
}

export const PriceSummary = ({ total, isCalculating, vatRate = 0 }: PriceSummaryProps) => {
  const brutto = vatRate > 0 ? total * (1 + vatRate) : total;
  const formattedTotal = total.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedBrutto = brutto.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-gray-800/80 rounded-xl border-2 border-gray-700 p-6 text-right">
      <p className="text-sm text-gray-400 mb-1">Gesamtsumme</p>

      <p className={`
        text-3xl font-bold transition-all duration-300
        ${isCalculating ? 'text-gray-500 animate-pulse' : 'text-yellow-400'}
      `}>
        {isCalculating ? '...' : `${formattedTotal} zł`}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        exkl. 0% MwSt. Brutto {formattedBrutto} zł zł *
      </p>
    </div>
  );
};
