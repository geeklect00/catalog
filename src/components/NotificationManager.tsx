import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function NotificationManager() {
  const { products } = useStore();
  const lastProductCount = React.useRef(products.length);

  // İZİN İSTEME KALDIRILDI - Artık otomatik bildirim izni istenmeyecek

  useEffect(() => {
    // Check for new products
    if (products.length > lastProductCount.current) {
      const newProduct = products[products.length - 1];
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Ürün Yüklendi!', {
          body: `${newProduct.name} şimdi stokta!`,
          icon: newProduct.media[0]?.url || '/favicon.ico'
        });
      }
    }
    lastProductCount.current = products.length;
  }, [products]);

  return null;
}