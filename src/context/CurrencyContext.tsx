import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'TRY' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  exchangeRate: number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [exchangeRate, setExchangeRate] = useState<number>(36.0); // Fallback rate
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Using awesomeapi which provides bid (alış) and ask (satış) rates
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-TRY');
        const data = await response.json();
        
        if (data && data.USDTRY) {
          const bid = parseFloat(data.USDTRY.bid);
          const ask = parseFloat(data.USDTRY.ask);
          
          // Prefer the lower rate (usually bid)
          const lowerRate = Math.min(bid, ask);
          setExchangeRate(lowerRate || bid);
        }
      } catch (error) {
        console.error('Döviz kuru çekilemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, exchangeRate, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
