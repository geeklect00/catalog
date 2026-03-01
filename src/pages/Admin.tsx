import React, { useState, useEffect } from 'react';
import { useStore, Product } from '../context/StoreContext';
import JSZip from 'jszip';
import { Plus, Trash2, Edit2, Save, X, Settings as SettingsIcon, Package, Upload, MoveUp, MoveDown, ArrowLeft, Copy, Download, FileText, Sun, Moon } from 'lucide-react';

// Cloudinary yapılandırması
// NOT: Bu değerleri kendi Cloudinary bilgilerinizle değiştirin
const CLOUDINARY_CLOUD_NAME = 'dfsdwqdnl'; // Cloudinary dashboard'dan alın
const CLOUDINARY_UPLOAD_PRESET = 'fuego-upload'; // Cloudinary'de oluşturduğunuz preset
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

export default function Admin() {
  const { products, settings, updateProduct, deleteProduct, updateSettings, uploadMedia, loading, exportData, importData, pages, updatePage, updateProductOrder } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'pages'>('products');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Local states for better input handling
  const [tempSettings, setTempSettings] = useState<any>(null);
  const [sizesInput, setSizesInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [lastEditingId, setLastEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTempSettings({ ...settings });
    }
  }, [settings]);

  useEffect(() => {
    if (editingProduct) {
      const currentId = editingProduct.id || 'new';
      if (currentId !== lastEditingId) {
        setSizesInput(editingProduct.sizes?.join(', ') || '');
        setCategoryInput(Array.isArray(editingProduct.category) ? editingProduct.category.join(', ') : (editingProduct.category || ''));
        setLastEditingId(currentId);
      }
    } else {
      setSizesInput('');
      setCategoryInput('');
      setLastEditingId(null);
    }
  }, [editingProduct, lastEditingId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!settings.adminUsername || !settings.adminPassword) {
      console.error('Settings not loaded yet');
      return;
    }

    if (username === settings.adminUsername && password === settings.adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      setError('Parola yanlış!');
    }
  };

  // Cloudinary'e dosya yükleme fonksiyonu
const uploadToCloudinary = async (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    
    return {
      url: data.secure_url,
      type: data.resource_type === 'video' ? 'video' : 'image'
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Yeni handleFileUpload (Cloudinary ile)
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  setIsUploading(true);
  setUploadError(null);
  
  try {
    const uploadedUrls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadToCloudinary(file);
      uploadedUrls.push(result);
    }
    
    // Önce ürünün media'sını güncelle (UI için)
    const updatedMedia = [...(editingProduct.media || []), ...uploadedUrls];
    setEditingProduct({
      ...editingProduct,
      media: updatedMedia
    });
    
    // Cloudinary URL'lerini backend'e kaydet
    const response = await fetch('/api/save-media-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        productId: editingProduct.id,
        mediaUrls: uploadedUrls 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save media URLs');
    }
    
    // Başarılı mesajı göster (opsiyonel)
    console.log('Dosyalar başarıyla yüklendi');
    
  } catch (error) {
    console.error('Upload error:', error);
    alert('Dosya yüklenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  } finally {
    setIsUploading(false);
    // File input'u temizle
    e.target.value = '';
  }
};

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    const newMedia = [...editingProduct.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    setEditingProduct({ ...editingProduct, media: newMedia });
  };

  const removeMedia = (index: number) => {
    const newMedia = editingProduct.media.filter((_: any, i: number) => i !== index);
    setEditingProduct({ ...editingProduct, media: newMedia });
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(tempSettings);
      alert('Ayarlar kaydedildi.');
      setActiveTab('products'); // Automatically return to products list
    } catch (err) {
      alert('Ayarlar kaydedilirken hata oluştu.');
    }
  };

  const handleAddSocial = () => {
    const newLink = { id: Date.now().toString(), platform: 'Instagram', url: '' };
    setTempSettings({
      ...tempSettings,
      socialLinks: [...(tempSettings.socialLinks || []), newLink]
    });
  };

  const removeSocial = (id: string) => {
    setTempSettings({
      ...tempSettings,
      socialLinks: tempSettings.socialLinks.filter((l: any) => l.id !== id)
    });
  };

  const updateSocial = (id: string, field: string, value: string) => {
    setTempSettings({
      ...tempSettings,
      socialLinks: tempSettings.socialLinks.map((l: any) => l.id === id ? { ...l, [field]: value } : l)
    });
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated = {
      ...product,
      id: '', // Clear ID to create new
      name: `${product.name} (Kopya)`,
      slug: `${product.slug}-kopya`
    };
    setEditingProduct(duplicated);
    setSizesInput(product.sizes.join(', '));
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const zip = new JSZip();
      
      // Add JSON data
      zip.file("data.json", JSON.stringify(data, null, 2));
      
      // Collect all local media URLs
      const localMediaUrls = new Set<string>();
      data.products.forEach((p: any) => {
        const media = JSON.parse(p.media);
        media.forEach((m: any) => {
          if (m.url.startsWith('/uploads/')) {
            localMediaUrls.add(m.url);
          }
        });
      });

      // Fetch and add media files to zip
      const mediaFolder = zip.folder("uploads");
      if (mediaFolder) {
        for (const url of localMediaUrls) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const fileName = url.split('/').pop();
            if (fileName) {
              mediaFolder.file(fileName, blob);
            }
          } catch (err) {
            console.error(`Failed to fetch media for export: ${url}`, err);
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fuego_full_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Dışa aktarma başarısız!');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    try {
      const zip = await JSZip.loadAsync(file);
      const dataFile = zip.file("data.json");
      
      if (!dataFile) {
        // Fallback for old JSON-only imports
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            await importData(data);
            alert('İçe aktarma başarılı!');
            window.location.reload();
          } catch (err) {
            alert('İçe aktarma başarısız! Dosya formatını kontrol edin.');
          }
        };
        reader.readAsText(file);
        return;
      }

      const dataJson = await dataFile.async("string");
      const data = JSON.parse(dataJson);

      // Upload media files first
      const uploadsFolder = zip.folder("uploads");
      if (uploadsFolder) {
        const filesToUpload: File[] = [];
        const promises: Promise<void>[] = [];
        
        uploadsFolder.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            promises.push((async () => {
              const blob = await zipEntry.async("blob");
              const fileName = relativePath.split('/').pop() || zipEntry.name;
              filesToUpload.push(new File([blob], fileName, { type: blob.type }));
            })());
          }
        });
        
        await Promise.all(promises);
        
        if (filesToUpload.length > 0) {
          // We need a way to upload these files to the server
          // The current uploadMedia takes a FileList, we can simulate it or adjust it
          const dataTransfer = new DataTransfer();
          filesToUpload.forEach(f => dataTransfer.items.add(f));
          await uploadMedia(dataTransfer.files);
        }
      }

      await importData(data);
      alert('İçe aktarma başarılı!');
      window.location.reload();
    } catch (err) {
      console.error('Import error:', err);
      alert('İçe aktarma başarısız! Dosya formatını kontrol edin.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        alert('Ürün silinemedi.');
      }
    }
  };

  const handleUpdateOrder = async (id: string, direction: 'up' | 'down') => {
    try {
      await updateProductOrder(id, direction);
    } catch (err) {
      alert('Sıralama güncellenemedi.');
    }
  };

  const handleSavePage = async () => {
    try {
      await updatePage(editingPage);
      alert('Sayfa kaydedildi.');
      setEditingPage(null);
    } catch (err) {
      alert('Sayfa kaydedilirken hata oluştu.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Admin Girişi</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-medium">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="w-full bg-black dark:bg-white dark:text-black text-white p-3 rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-800'}`}
              >
                <Package className="w-4 h-4 mr-2" /> Ürünler
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pages' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-800'}`}
              >
                <FileText className="w-4 h-4 mr-2" /> Sayfalar
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-800'}`}
              >
                <SettingsIcon className="w-4 h-4 mr-2" /> Ayarlar
              </button>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ürün Listesi ({products.length})</h2>
              <div className="flex flex-wrap gap-2">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center text-sm">
                  <Upload className="w-4 h-4 mr-2" /> İçe Aktar
                  <input type="file" className="hidden" accept=".json,.zip" onChange={handleImport} />
                </label>
                <button 
                  onClick={handleExport}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-2" /> Dışa Aktar
                </button>
                <button
                  onClick={() => {
                    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
                    setEditingProduct({ name: '', pricePerPiece: 0, category: [], sizes: defaultSizes, colors: [], media: [], piecesPerSeries: 1, fabricInfo: '', status: 'Yayında', colorCount: 0, orderIndex: 0, seoTitle: '', seoDescription: '', slug: '' });
                    setSizesInput(defaultSizes.join(', '));
                    setCategoryInput('');
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Yeni Ürün
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {p.media[0]?.type === 'video' ? (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">Video</div>
                      ) : (
                        <img src={p.media[0]?.url} alt="" className="w-16 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      )}
                      <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.pricePerPiece} ₺</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="flex flex-col mr-2">
                        <button 
                          onClick={() => handleUpdateOrder(p.id, 'up')}
                          className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateOrder(p.id, 'down')}
                          className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDuplicateProduct(p)} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                        title="Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'pages' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Statik Sayfalar</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pages.map((page) => (
                <div key={page.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{page.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">/{page.slug}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingPage(page)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Site Ayarları</h2>
              <button 
                onClick={() => setActiveTab('products')}
                className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Geri
              </button>
            </div>
            
            {tempSettings && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Şirket İsmi</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={tempSettings.companyName}
                    onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hero Başlık</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={tempSettings.heroTitle}
                    onChange={(e) => setTempSettings({ ...tempSettings, heroTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hero Açıklama</label>
                  <textarea
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={tempSettings.heroDescription}
                    onChange={(e) => setTempSettings({ ...tempSettings, heroDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Footer Metni</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={tempSettings.footerText}
                    onChange={(e) => setTempSettings({ ...tempSettings, footerText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp Numarası (90...)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={tempSettings.whatsappNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Sosyal Medya Linkleri</h3>
                    <button 
                      onClick={handleAddSocial}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      + Ekle
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tempSettings.socialLinks?.map((link: any) => (
                      <div key={link.id} className="flex gap-2 items-center">
                        <select 
                          className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                          value={link.platform}
                          onChange={(e) => updateSocial(link.id, 'platform', e.target.value)}
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                        </select>
                        <input
                          type="text"
                          placeholder="URL"
                          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                          value={link.url}
                          onChange={(e) => updateSocial(link.id, 'url', e.target.value)}
                        />
                        <button 
                          onClick={() => removeSocial(link.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="font-bold mb-4">Admin Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={tempSettings.adminUsername}
                        onChange={(e) => setTempSettings({ ...tempSettings, adminUsername: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Şifre</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        value={tempSettings.adminPassword}
                        onChange={(e) => setTempSettings({ ...tempSettings, adminPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" /> Ayarları Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Edit Modal */}
        {editingPage && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold">Sayfayı Düzenle: {editingPage.title}</h3>
                <button onClick={() => setEditingPage(null)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Sayfa Başlığı</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İçerik (Markdown)</label>
                  <textarea
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[300px] font-mono text-sm"
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  />
                </div>
                <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">SEO Ayarları</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Başlığı</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingPage.seoTitle || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Açıklaması</label>
                    <textarea
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingPage.seoDescription || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
                <button onClick={() => setEditingPage(null)} className="px-4 py-2 border rounded-lg">İptal</button>
                <button
                  onClick={handleSavePage}
                  className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingProduct.id ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3>
                <button onClick={() => setEditingProduct(null)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ürün İsmi</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori (Virgülle ayırın)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={categoryInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryInput(val);
                        setEditingProduct({ ...editingProduct, category: val.split(',').map(c => c.trim()).filter(c => c !== '') });
                      }}
                      placeholder="Tişört, Pantolon"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Adet Fiyatı (₺)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingProduct.pricePerPiece === 0 ? '' : editingProduct.pricePerPiece}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+/, '');
                        setEditingProduct({ ...editingProduct, pricePerPiece: val === '' ? 0 : Number(val) });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Serideki Adet</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingProduct.piecesPerSeries === 0 ? '' : editingProduct.piecesPerSeries}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+/, '');
                        setEditingProduct({ ...editingProduct, piecesPerSeries: val === '' ? 0 : Number(val) });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ek Bilgiler</label>
                  <textarea
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
                    value={editingProduct.fabricInfo || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabricInfo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bedenler (Virgülle ayırın)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={sizesInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSizesInput(val);
                        setEditingProduct({ ...editingProduct, sizes: val.split(',').map(s => s.trim()).filter(s => s !== '') });
                      }}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Durum</label>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingProduct.status || 'Yayında'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    >
                      <option value="Yayında">Yayında</option>
                      <option value="Gizli">Gizli</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Renk Seçeneği (Örn: 12 veya +10)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      value={editingProduct.colorCount || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, colorCount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Media Upload & Sorting */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-1">Görsel ve Videolar</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Upload className={`w-10 h-10 mb-2 ${isUploading ? 'animate-bounce' : ''}`} />
                    <p className="text-sm text-gray-500">{isUploading ? 'Yükleniyor...' : 'Dosyaları buraya bırakın veya tıklayın'}</p>
					{/* BURAYA YENİ SATIRLARI EKLEYİN */}
					{uploadError && (
					  <p className="text-sm text-red-500 mt-2">Hata: {uploadError}</p>
					)}
				  </div>

                  <div className="space-y-2">
                    {editingProduct.media.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border dark:border-gray-600">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden mr-3">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">Video</div>
                          ) : (
                            <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <span className="flex-1 text-xs truncate">{item.url}</span>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => moveMedia(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30">
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveMedia(idx, 'down')} disabled={idx === editingProduct.media.length - 1} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30">
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeMedia(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2 border rounded-lg">İptal</button>
                <button
                  onClick={async () => {
                    try {
                      await updateProduct(editingProduct);
                      setEditingProduct(null);
                    } catch (err) {
                      alert('Ürün kaydedilirken hata oluştu.');
                    }
                  }}
                  className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

