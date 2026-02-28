import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useStore } from '../context/StoreContext';

import ReactMarkdown from 'react-markdown';

export default function FAQ() {
  const { pages } = useStore();
  const faqPage = pages.find(p => p.id === 'sss');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
          {faqPage?.title || 'Sıkça Sorulan Sorular'}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            {faqPage?.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{faqPage.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Minimum sipariş miktarı nedir?</h3>
                  <p className="text-gray-600 dark:text-gray-400">Toptan satış yaptığımız için ürünlerimiz seri bazlı satılmaktadır. Her ürünün seri adedi ürün detayında belirtilmiştir.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kargo süreci nasıl işliyor?</h3>
                  <p className="text-gray-600 dark:text-gray-400">Siparişleriniz onaylandıktan sonra 24-48 saat içerisinde kargoya teslim edilir. Kargo takip numarası tarafınıza iletilir.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ödeme seçenekleri nelerdir?</h3>
                  <p className="text-gray-600 dark:text-gray-400">Banka havalesi, EFT ve kredi kartı ile ödeme yapabilirsiniz.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">İade ve değişim var mı?</h3>
                  <p className="text-gray-600 dark:text-gray-400">Toptan satışlarda üretim hatası olmadığı sürece iade kabul edilmemektedir. Hatalı ürünlerde 7 gün içerisinde değişim hakkınız mevcuttur.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
