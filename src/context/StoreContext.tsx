import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface WheelReward {
  id: string;
  label: string;
  value: number;
  probability: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerPiece: number;
  piecesPerSeries: number;
  sizes: string[];
  colors: string[];
  media: { type: 'image' | 'video', url: string }[];
  isNew?: boolean;
  fabricInfo?: string;
  status: 'Yayında' | 'Gizli';
  colorCount: string;
  orderIndex: number;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
}

interface Settings {
  companyName: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  whatsappNumber: string;
  socialLinks: SocialLink[];
  adminUsername?: string;
  adminPassword?: string;
  isWheelActive: boolean;
  wheelRewards: WheelReward[];
}

interface StoreContextType {
  products: Product[];
  settings: Settings;
  pages: Page[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshPages: () => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  updatePage: (page: Page) => Promise<void>;
  updateProductOrder: (productId: string, direction: 'up' | 'down') => Promise<void>;
  uploadMedia: (files: FileList, onProgress?: (percent: number) => void) => Promise<{ type: 'image' | 'video', url: string }[]>;
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({
    companyName: 'Fuego Toptan',
    heroTitle: 'Toptan Katalog',
    heroDescription: 'En yeni sezon ürünlerimizi inceleyin. Fiyatlar toptan alımlar içindir.',
    footerText: '© 2026 Fuego Toptan. Tüm hakları saklıdır.',
    whatsappNumber: '905519597784',
    socialLinks: [],
    adminUsername: 'canxakgun',
    isWheelActive: false,
    wheelRewards: []
  });
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const refreshPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error('Failed to fetch pages', err);
    }
  };

  useEffect(() => {
    Promise.all([refreshProducts(), refreshSettings(), refreshPages()]).finally(() => setLoading(false));
  }, []);

  const updateProduct = async (product: Product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Ürün kaydedilemedi');
    }
    await refreshProducts();
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ürün silinemedi');
    await refreshProducts();
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) throw new Error('Ayarlar kaydedilemedi');
    await refreshSettings();
  };

  const updatePage = async (page: Page) => {
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    });
    if (!res.ok) throw new Error('Sayfa kaydedilemedi');
    await refreshPages();
  };

  const updateProductOrder = async (productId: string, direction: 'up' | 'down') => {
    const res = await fetch('/api/products/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, direction }),
    });
    if (!res.ok) throw new Error('Sıralama güncellenemedi');
    await refreshProducts();
  };

  const uploadMedia = async (files: FileList, onProgress?: (percent: number) => void) => {
    return new Promise<{ type: 'image' | 'video', url: string }[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Yükleme başarısız'));
          }
        }
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const exportData = async () => {
    const res = await fetch('/api/export');
    return await res.json();
  };

  const importData = async (data: any) => {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('İçe aktarma başarısız');
    await Promise.all([refreshProducts(), refreshSettings(), refreshPages()]);
  };

  return (
    <StoreContext.Provider value={{ 
      products, 
      settings, 
      pages,
      loading, 
      refreshProducts, 
      refreshSettings,
      refreshPages,
      updateProduct,
      deleteProduct,
      updateSettings,
      updatePage,
      updateProductOrder,
      uploadMedia,
      exportData,
      importData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
