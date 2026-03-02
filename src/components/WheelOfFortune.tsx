import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WheelOfFortune() {
  // ÇARK TAMAMEN DEVRE DIŞI
  return null;
  
  // AŞAĞIDAKİ KODLAR ÇALIŞMAYACAK (dokunmayın)
  /*
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if wheel should be shown
    const hasSpun = localStorage.getItem('fuego_wheel_spun');
    if (settings.isWheelActive && !hasSpun) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [settings.isWheelActive]);

  if (!isOpen || !settings.isWheelActive) return null;

  const rewards = settings.wheelRewards || [];
  const segmentAngle = 360 / rewards.length;

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomStop = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (extraSpins * 360) + randomStop;
    
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualStop = (360 - (totalRotation % 360)) % 360;
      const rewardIndex = Math.floor(actualStop / segmentAngle);
      const wonReward = rewards[rewardIndex];
      
      setResult(wonReward.label);
      localStorage.setItem('fuego_wheel_spun', 'true');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#FFD700']
      });
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-8 text-center border border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!result ? (
          <>
            <div className="mb-6">
              <div className="inline-flex p-3 bg-black dark:bg-white rounded-2xl mb-4">
                <Gift className="w-8 h-8 text-white dark:text-black" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Şans Çarkını Çevir!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sürpriz indirimler ve hediyeler seni bekliyor.</p>
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 bg-red-500 clip-path-triangle rotate-180 shadow-lg"></div>
              
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-8 border-gray-100 dark:border-gray-800 relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {rewards.map((reward, i) => (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 w-1/2 h-full origin-left"
                    style={{ 
                      transform: `rotate(${i * segmentAngle}deg)`,
                      backgroundColor: i % 2 === 0 ? '#000000' : '#f3f4f6'
                    }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: i % 2 === 0 ? '#ffffff' : '#000000' }}
                    >
                      {reward.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                isSpinning 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
              }`}
            >
              {isSpinning ? 'Çark Dönüyor...' : 'ŞİMDİ ÇEVİR'}
            </button>
          </>
        ) : (
          <div className="py-8 animate-in fade-in zoom-in duration-500">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tebrikler!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Kazandığınız ödül:</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 mb-8">
              <span className="text-2xl font-bold text-black dark:text-white">{result}</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              Ödülünüzü kullanmak için WhatsApp üzerinden bizimle iletişime geçebilirsiniz.
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              KAPAT
            </button>
          </div>
        )}
      </div>
    </div>
  );
  */
}