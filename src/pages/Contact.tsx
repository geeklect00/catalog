import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Contact() {
  const { settings, pages } = useStore();
  const contactPage = pages.find(p => p.id === 'iletisim');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          {contactPage?.title || 'İletişim'}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
          Sorularınız ve toptan sipariş talepleriniz için bizimle iletişime geçebilirsiniz.
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="h-6 w-6 text-white dark:text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">E-posta</h3>
                <a href="mailto:fuegowholesale@gmail.com" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  fuegowholesale@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">WhatsApp</h3>
                <a 
                  href={`https://wa.me/${settings.whatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                >
                  +{settings.whatsappNumber}
                </a>
              </div>
            </div>

            {contactPage?.content && (
              <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                  {contactPage.content}
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
