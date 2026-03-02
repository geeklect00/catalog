import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// ===== MONGODB MODELLERİ =====
// Product modeli
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: mongoose.Schema.Types.Mixed,
  pricePerPiece: Number,
  piecesPerSeries: Number,
  sizes: { type: mongoose.Schema.Types.Mixed, default: [] },
  colors: { type: mongoose.Schema.Types.Mixed, default: [] },
  media: { type: mongoose.Schema.Types.Mixed, default: [] },
  isNew: Number,
  fabricInfo: String,
  status: { type: String, default: 'Yayında' },
  colorCount: { type: String, default: '0' },
  orderIndex: { type: Number, default: 0 },
  seoTitle: String,
  seoDescription: String,
  slug: String
}, { timestamps: true });

// Settings modeli
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Pages modeli
const pageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  content: String,
  seoTitle: String,
  seoDescription: String,
  slug: String
}, { timestamps: true });

// Modelleri oluştur
const Product = mongoose.model('Product', productSchema);
const Setting = mongoose.model('Setting', settingSchema);
const Page = mongoose.model('Page', pageSchema);
// ==============================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed initial data if empty
async function seedInitialData() {
  try {
    // Products kontrol et
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Başlangıç ürünleri ekleniyor...');
      const initialProducts = [
        {
          id: "fuego-001",
          name: "Oversize Basic Tişört",
          category: "Tişört",
          pricePerPiece: 150,
          piecesPerSeries: 4,
          sizes: ["S", "M", "L", "XL"],
          colors: ["Siyah", "Beyaz", "Bej"],
          media: [
            { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
            { type: 'image', url: 'https://picsum.photos/seed/tshirt1a/600/800' },
            { type: 'image', url: 'https://picsum.photos/seed/tshirt1b/600/800' }
          ],
          isNew: 1,
          fabricInfo: "%100 Pamuk, 30/1 Süprem",
          status: 'Yayında',
          colorCount: "3",
          orderIndex: 0,
          seoTitle: 'Oversize Basic Tişört - Fuego Toptan',
          seoDescription: 'En kaliteli oversize basic tişörtler Fuego Toptan\'da.',
          slug: 'oversize-basic-tisort'
        }
      ];
      
      for (const p of initialProducts) {
        await Product.create(p);
      }
      console.log('✅ Başlangıç ürünleri eklendi');
    }

    // Settings kontrol et
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      console.log('⚙️ Başlangıç ayarları ekleniyor...');
      const initialSettings = [
        { key: "companyName", value: "Fuego Toptan" },
        { key: "heroTitle", value: "Toptan Katalog" },
        { key: "heroDescription", value: "En yeni sezon ürünlerimizi inceleyin. Fiyatlar toptan alımlar içindir." },
        { key: "footerText", value: "© 2026 Fuego Toptan. Tüm hakları saklıdır." },
        { key: "whatsappNumber", value: "905519597784" },
        { key: "socialLinks", value: [
          { id: '1', platform: 'Instagram', url: 'https://instagram.com' },
          { id: '2', platform: 'Facebook', url: 'https://facebook.com' }
        ] },
        { key: "adminUsername", value: "canxakgun" },
        { key: "adminPassword", value: "Can@426834" },
        { key: "isWheelActive", value: "false" },
        { key: "wheelRewards", value: [
          { id: '1', label: '200 TL Hediye', value: 200, probability: 0.02 },
          { id: '2', label: '100 TL Hediye', value: 100, probability: 0.02 },
          { id: '3', label: 'Pas', value: 0, probability: 0.96 }
        ] }
      ];
      
      for (const s of initialSettings) {
        await Setting.create(s);
      }
      console.log('✅ Başlangıç ayarları eklendi');
    }

    // Pages kontrol et
    const pagesCount = await Page.countDocuments();
    if (pagesCount === 0) {
      console.log('📄 Başlangıç sayfaları ekleniyor...');
      const initialPages = [
        { 
          id: 'iletisim', 
          title: 'İletişim', 
          content: 'Bize fuegowholesale@gmail.com adresinden ulaşabilirsiniz.', 
          seoTitle: 'İletişim - Fuego Toptan', 
          seoDescription: 'Fuego Toptan iletişim bilgileri.', 
          slug: 'iletisim' 
        },
        { 
          id: 'sss', 
          title: 'Sıkça Sorulan Sorular', 
          content: `**Minimum sipariş adeti var mı?**
Evet, genellikle minimum 50 adettir.

**Hangi ödeme yöntemlerini kabul ediyorsunuz?**
Banka havalesi, EFT ve mağazamızda nakit kabul edilir.

**İstanbul'da değilim, X şehirde referansınız var mı?**
Türkiye'nin 81 ilinden müşteri referansımız mevcuttur. Sipariş öncesi referanslarımız ile görüşebilirsiniz.

**Siparişim ne zaman kargolanır?**
Siparişler genellikle aynı gün içinde kargolanır.

**Türkiye dışına gönderim yapıyor musunuz?**
Evet, yurt dışı gönderim için bizimle iletişime geçebilirsiniz.

**Özel üretim veya toptan büyük sipariş verebilir miyim?**
Evet, büyük adetli ve özel üretim siparişleri için bizimle iletişime geçin.`, 
          seoTitle: 'Sıkça Sorulan Sorular - Fuego Toptan', 
          seoDescription: 'Fuego Toptan hakkında merak edilenler.', 
          slug: 'sss' 
        },
        { 
          id: 'hakkimizda', 
          title: 'Hakkımızda', 
          content: 'Fuego Toptan olarak 2026 yılından beri hizmet vermekteyiz.', 
          seoTitle: 'Hakkımızda - Fuego Toptan', 
          seoDescription: 'Fuego Toptan hikayesi.', 
          slug: 'hakkimizda' 
        }
      ];
      
      for (const pg of initialPages) {
        await Page.create(pg);
      }
      console.log('✅ Başlangıç sayfaları eklendi');
    }
  } catch (error) {
    console.error('❌ Seed hatası:', error);
  }
}

// Seed işlemini başlat
seedInitialData();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Cloudinary URL'lerini kaydetme endpoint'i
  app.post("/api/save-media-urls", async (req, res) => {
    try {
      const { productId, mediaUrls } = req.body;
      
      // Mevcut ürünü bul
      const product = await Product.findOne({ id: productId });
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Mevcut media varsa kullan, yoksa boş dizi
      let existingMedia = product.media || [];
      
      // Yeni medyaları ekle
      const updatedMedia = [...existingMedia, ...mediaUrls];
      
      // Güncelle
      product.media = updatedMedia;
      await product.save();
      
      res.json({ success: true, mediaUrls: updatedMedia });
    } catch (err) {
      console.error("Error saving media URLs:", err);
      res.status(500).json({ error: "Failed to save media URLs" });
    }
  });

  // API Routes
  app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ orderIndex: 1 });
    
    // Her ürünü formatla
    const formattedProducts = products.map((p: any) => {
      const product = p.toObject();
      
      // MEDIA DÜZELTMESİ: Her zaman dizi olmasını sağla
      if (product.media) {
        // Eğer string ise parse et
        if (typeof product.media === 'string') {
          try {
            product.media = JSON.parse(product.media);
          } catch {
            product.media = [];
          }
        }
        // Eğer dizi değilse boş dizi yap
        else if (!Array.isArray(product.media)) {
          product.media = [];
        }
      } else {
        product.media = [];
      }
      
      // SİZES düzeltmesi
      if (product.sizes && typeof product.sizes === 'string') {
        try {
          product.sizes = JSON.parse(product.sizes);
        } catch {
          product.sizes = [];
        }
      } else if (!Array.isArray(product.sizes)) {
        product.sizes = [];
      }
      
      // COLORS düzeltmesi
      if (product.colors && typeof product.colors === 'string') {
        try {
          product.colors = JSON.parse(product.colors);
        } catch {
          product.colors = [];
        }
      } else if (!Array.isArray(product.colors)) {
        product.colors = [];
      }
      
      // CATEGORY düzeltmesi (eğer gerekirse)
      if (product.category && typeof product.category === 'string') {
        try {
          // Eğer JSON string ise parse et
          if (product.category.startsWith('[') || product.category.startsWith('{')) {
            product.category = JSON.parse(product.category);
          }
        } catch {
          // Olduğu gibi bırak
        }
      }
      
      product.isNew = !!product.isNew;
      return product;
    });
    
    res.json(formattedProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

  app.post("/api/products", async (req, res) => {
    const p = req.body;
    const id = p.id || `fuego-${Date.now()}`;
    try {
      const productData = {
        id,
        name: p.name,
        category: p.category,
        pricePerPiece: p.pricePerPiece,
        piecesPerSeries: p.piecesPerSeries,
        sizes: p.sizes || [],
        colors: p.colors || [],
        media: p.media || [],
        isNew: p.isNew ? 1 : 0,
        fabricInfo: p.fabricInfo || '',
        status: p.status || 'Yayında',
        colorCount: String(p.colorCount || '0'),
        orderIndex: p.orderIndex || 0,
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
        slug: p.slug || ''
      };
      
      // upsert: varsa güncelle, yoksa ekle
      await Product.findOneAndUpdate({ id }, productData, { upsert: true, new: true });
      
      res.json({ success: true, id });
    } catch (err) {
      console.error('Error saving product:', err);
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  app.post("/api/products/order", async (req, res) => {
    const { productId, direction } = req.body;
    try {
      // Tüm ürünleri orderIndex'e göre sırala
      const products = await Product.find().sort({ orderIndex: 1, id: 1 });
      const currentIndex = products.findIndex((p: any) => p.id === productId);
      
      if (currentIndex === -1) return res.status(404).json({ error: 'Product not found' });
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < products.length) {
        // Sırayı değiştir
        const tempOrderIndex = products[currentIndex].orderIndex;
        products[currentIndex].orderIndex = products[targetIndex].orderIndex;
        products[targetIndex].orderIndex = tempOrderIndex;
        
        // Kaydet
        await products[currentIndex].save();
        await products[targetIndex].save();
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Order update error:', err);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Media Cleanup logic
  const deletionQueue: { path: string, deleteAt: number }[] = [];

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const product = await Product.findOne({ id: req.params.id });
      
      if (product && product.media) {
        const media = product.media;
        media.forEach((m: any) => {
          if (m.url && m.url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, m.url);
            deletionQueue.push({ path: filePath, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });
          }
        });
      }
      
      await Product.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Background cleanup task
  setInterval(() => {
    const now = Date.now();
    while (deletionQueue.length > 0 && deletionQueue[0].deleteAt <= now) {
      const item = deletionQueue.shift();
      if (item && fs.existsSync(item.path)) {
        try {
          fs.unlinkSync(item.path);
          console.log(`Deleted media: ${item.path}`);
        } catch (err) {
          console.error(`Failed to delete media: ${item.path}`, err);
        }
      }
    }
  }, 60 * 60 * 1000); // Check every hour

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await Setting.find();
      const settingsObj = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(settingsObj);
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post("/api/settings", async (req, res) => {
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        await Setting.findOneAndUpdate(
          { key }, 
          { value }, 
          { upsert: true }
        );
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving settings:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Pages Routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await Page.find();
      res.json(pages);
    } catch (err) {
      console.error('Error fetching pages:', err);
      res.status(500).json({ error: 'Failed to fetch pages' });
    }
  });

  app.post("/api/pages", async (req, res) => {
    const pg = req.body;
    try {
      await Page.findOneAndUpdate(
        { id: pg.id },
        pg,
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving page:', err);
      res.status(500).json({ error: 'Failed to save page' });
    }
  });

  // Export/Import Routes
  app.get("/api/export", async (req, res) => {
    try {
      const products = await Product.find();
      const settings = await Setting.find();
      const pages = await Page.find();
      res.json({ products, settings, pages });
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: 'Export failed' });
    }
  });

  app.post("/api/import", async (req, res) => {
    const { products, settings, pages } = req.body;
    
    try {
      // Transaction gibi işlem - hepsini sırayla yap
      if (products && products.length) {
        await Product.deleteMany({});
        for (const p of products) {
          await Product.create(p);
        }
      }
      
      if (settings && settings.length) {
        await Setting.deleteMany({});
        for (const s of settings) {
          await Setting.create(s);
        }
      }
      
      if (pages && pages.length) {
        await Page.deleteMany({});
        for (const pg of pages) {
          await Page.create(pg);
        }
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ error: 'Import failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();