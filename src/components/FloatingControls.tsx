import { useCurrency } from "../context/CurrencyContext";

export default function FloatingControls() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold p-4 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-300 flex items-center justify-center w-[60px] h-[60px]"
      aria-label="Para Birimini Değiştir"
    >
      <span className="text-sm font-bold">{currency === 'TRY' ? 'USD' : 'TL'}</span>
    </button>
  );
}
