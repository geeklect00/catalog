import { Instagram, Facebook, Twitter, Music2, Youtube } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Link } from "react-router-dom";

const getIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className="h-6 w-6" />;
    case 'facebook': return <Facebook className="h-6 w-6" />;
    case 'twitter': return <Twitter className="h-6 w-6" />;
    case 'tiktok': return <Music2 className="h-6 w-6" />;
    case 'youtube': return <Youtube className="h-6 w-6" />;
    default: return null;
  }
};

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white uppercase tracking-tighter mb-4">
              {settings.companyName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toptan giyimde kalitenin ve güvenin adresi. En yeni koleksiyonlarımızla hizmetinizdeyiz.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/sss" className="hover:text-black dark:hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/iletisim" className="hover:text-black dark:hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {Array.isArray(settings.socialLinks) && settings.socialLinks.some(link => link.url && link.url.trim() !== '') && (
            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Sosyal Medya</h4>
              <div className="flex space-x-4">
                {settings.socialLinks.filter(link => link.url && link.url.trim() !== '').map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {getIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
