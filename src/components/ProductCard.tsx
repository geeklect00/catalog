import React, { useState } from "react";
import { Product } from "../context/StoreContext";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

interface ProductCardProps {
  product: Product;
  key?: string;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const { currency, exchangeRate } = useCurrency();

  const openGallery = (index: number) => {
    setCurrentMediaIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev === product.media.length - 1 ? 0 : prev + 1));
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev === 0 ? product.media.length - 1 : prev - 1));
  };

  const hasVideo = product.media.some(m => m.type === 'video');
  const displayMedia = product.media.slice(0, 3);
  const remainingCount = Math.max(0, product.media.length - 3);

  const displayPrice = currency === 'TRY' 
    ? product.pricePerPiece 
    : Math.ceil((product.pricePerPiece / exchangeRate) * 10) / 10;
  
  const formattedPrice = currency === 'TRY'
    ? `${displayPrice.toLocaleString('tr-TR')} ₺`
    : `$${displayPrice.toFixed(2)}`;

  return (
    <>
      <div className="group relative flex flex-col bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        {/* Image Grid Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 p-1">
          {/* Color Count Badge */}
          {product.colorCount && product.colorCount !== '0' && (
            <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-medium border border-white/20">
              {product.colorCount} Renk Seçeneği
            </div>
          )}

            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full w-full">
              {/* Left large media */}
              <div 
                className="row-span-2 col-span-1 relative cursor-pointer overflow-hidden rounded-l-lg bg-gray-200 dark:bg-gray-800"
                onClick={() => openGallery(0)}
              >
                {displayMedia[0]?.type === 'video' ? (
                  <div className="h-full w-full relative">
                    <video src={displayMedia[0].url} className="h-full w-full object-cover" muted playsInline />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={displayMedia[0]?.url}
                    alt={`${product.name} - 1`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
              </div>
              
              {/* Top right media */}
              <div 
                className="row-span-1 col-span-1 relative cursor-pointer overflow-hidden rounded-tr-lg bg-gray-200 dark:bg-gray-800"
                onClick={() => openGallery(1)}
              >
                {displayMedia[1] ? (
                  displayMedia[1].type === 'video' ? (
                    <div className="h-full w-full relative">
                      <video src={displayMedia[1].url} className="h-full w-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={displayMedia[1]?.url}
                      alt={`${product.name} - 2`}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <ChevronRight className="w-6 h-6 opacity-20" />
                  </div>
                )}
              </div>

              {/* Bottom right media */}
              <div 
                className="row-span-1 col-span-1 relative cursor-pointer overflow-hidden rounded-br-lg bg-gray-200 dark:bg-gray-800"
                onClick={() => openGallery(2)}
              >
                {displayMedia[2] ? (
                  displayMedia[2].type === 'video' ? (
                    <div className="h-full w-full relative">
                      <video src={displayMedia[2].url} className="h-full w-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={displayMedia[2]?.url}
                      alt={`${product.name} - 3`}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <ChevronRight className="w-6 h-6 opacity-20" />
                  </div>
                )}
                {remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex flex-col items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight text-center w-full">
              {product.name}
            </h3>
            {product.fabricInfo && (
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center font-medium whitespace-pre-wrap">
                {product.fabricInfo}
              </span>
            )}
          </div>

          <div className="mt-auto space-y-3">
            {/* Size & Series Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 text-[10px] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-1">
                <span className="font-medium whitespace-nowrap">Seri:</span>
                <span className="break-words w-full sm:w-auto sm:text-right">{product.sizes.join(" - ")}</span>
              </div>
            </div>

            {/* Pricing - Only Adet Fiyatı */}
            <div className="flex justify-center pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Adet Fiyatı</span>
                <span className="text-lg font-bold text-black dark:text-white">{formattedPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
          <button 
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center px-12 mt-8 mb-4">
            <button 
              onClick={prevMedia}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            {product.media[currentMediaIndex].type === 'video' ? (
              <video 
                src={product.media[currentMediaIndex].url} 
                controls 
                autoPlay
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <img 
                src={product.media[currentMediaIndex].url} 
                alt={`${product.name} - ${currentMediaIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
                referrerPolicy="no-referrer"
              />
            )}

            <button 
              onClick={nextMedia}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="w-full max-w-4xl px-4 pb-8 flex gap-2 overflow-x-auto justify-center items-center">
            {product.media.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex(idx);
                }}
                className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                  currentMediaIndex === idx ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                ) : (
                  <img 
                    src={item.url} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
