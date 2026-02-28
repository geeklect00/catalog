import React, { useState } from "react";
import { Menu, Search, Sun, Moon, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useStore } from "../context/StoreContext";
import { Link } from "react-router-dom";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button" 
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-2"
            >
              <span className="sr-only">Menüyü aç</span>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center sm:justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white uppercase">
                {settings.companyName}
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-8">
            <Link to="/" className="text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 border-black dark:border-white text-sm font-medium">
              Anasayfa
            </Link>
            <Link to="/iletisim" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
              İletişim
            </Link>
            <Link to="/sss" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
              Sıkça Sorulan Sorular
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-2 transition-colors"
            >
              <span className="sr-only">Temayı Değiştir</span>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Anasayfa
            </Link>
            <Link 
              to="/iletisim" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              İletişim
            </Link>
            <Link 
              to="/sss" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sıkça Sorulan Sorular
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
