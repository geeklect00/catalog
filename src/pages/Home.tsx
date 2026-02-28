import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import WheelOfFortune from '../components/WheelOfFortune';
import WhatsAppButton from "../components/WhatsAppButton";
import FloatingControls from "../components/FloatingControls";
import { useStore } from '../context/StoreContext';
import { LayoutGrid, ListFilter } from 'lucide-react';

export default function Home() {
  const { products, settings, loading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (Array.isArray(p.category)) {
        p.category.forEach(c => cats.add(c));
      } else if (p.category) {
        cats.add(p.category);
      }
    });
    return ['Tümü', ...Array.from(cats)].filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'Yayında');

    if (selectedCategory !== 'Tümü') {
      result = result.filter(p => {
        if (Array.isArray(p.category)) {
          return p.category.includes(selectedCategory);
        }
        return p.category === selectedCategory;
      });
    }

    // Always sort by orderIndex
    result = [...result].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    return result;
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Section */}
        <div className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-black dark:bg-white rounded-lg">
                <LayoutGrid className="w-5 h-5 text-white dark:text-black" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kategoriler</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all transform active:scale-95 shadow-sm border ${
                  selectedCategory === cat
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500 dark:text-gray-400">Seçtiğiniz kriterlere uygun ürün bulunmamaktadır.</p>
          </div>
        )}
      </main>

      <Footer />
      <FloatingControls />
      <WhatsAppButton />
      <WheelOfFortune />
    </div>
  );
}
