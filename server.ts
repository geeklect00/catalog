import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Initialize database with unified media column and new fields
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    pricePerPiece REAL,
    piecesPerSeries INTEGER,
    sizes TEXT,
    colors TEXT,
    media TEXT, -- JSON array of { type: 'image' | 'video', url: string }
    isNew INTEGER,
    fabricInfo TEXT,
    status TEXT DEFAULT 'Yayında', -- 'Yayında' or 'Gizli'
    colorCount TEXT DEFAULT '0',
    orderIndex INTEGER DEFAULT 0,
    seoTitle TEXT,
    seoDescription TEXT,
    slug TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    seoTitle TEXT,
    seoDescription TEXT,
    slug TEXT
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const initialProducts = [
    {
      id: "fuego-001",
      name: "Oversize Basic Tişört",
      category: "Tişört",
      pricePerPiece: 150,
      piecesPerSeries: 4,
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify(["Siyah", "Beyaz", "Bej"]),
      media: JSON.stringify([
        { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { type: 'image', url: 'https://picsum.photos/seed/tshirt1a/600/800' },
        { type: 'image', url: 'https://picsum.photos/seed/tshirt1b/600/800' }
      ]),
      isNew: 1,
      fabricInfo: "%100 Pamuk, 30/1 Süprem",
      status: 'Yayında',
      colorCount: 3,
      orderIndex: 0,
      seoTitle: 'Oversize Basic Tişört - Fuego Toptan',
      seoDescription: 'En kaliteli oversize basic tişörtler Fuego Toptan\'da.',
      slug: 'oversize-basic-tisort'
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, category, pricePerPiece, piecesPerSeries, sizes, colors, media, isNew, fabricInfo, status, colorCount, orderIndex, seoTitle, seoDescription, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of initialProducts) {
    insertProduct.run(p.id, p.name, p.category, p.pricePerPiece, p.piecesPerSeries, p.sizes, p.colors, p.media, p.isNew, p.fabricInfo, p.status, p.colorCount, p.orderIndex, p.seoTitle, p.seoDescription, p.slug);
  }

  const initialSettings = [
    { key: "companyName", value: "Fuego Toptan" },
    { key: "heroTitle", value: "Toptan Katalog" },
    { key: "heroDescription", value: "En yeni sezon ürünlerimizi inceleyin. Fiyatlar toptan alımlar içindir." },
    { key: "footerText", value: "© 2026 Fuego Toptan. Tüm hakları saklıdır." },
    { key: "whatsappNumber", value: "905519597784" },
    { key: "socialLinks", value: JSON.stringify([
      { id: '1', platform: 'Instagram', url: 'https://instagram.com' },
      { id: '2', platform: 'Facebook', url: 'https://facebook.com' }
    ]) },
    { key: "adminUsername", value: "canxakgun" },
    { key: "adminPassword", value: "Can@426834" },
    { key: "isWheelActive", value: "false" },
    { key: "wheelRewards", value: JSON.stringify([
      { id: '1', label: '200 TL Hediye', value: 200, probability: 0.02 }, // 200/10000 = 0.02
      { id: '2', label: '100 TL Hediye', value: 100, probability: 0.02 }, // 100/5000 = 0.02
      { id: '3', label: 'Pas', value: 0, probability: 0.96 }
    ]) }
  ];

  const insertSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  for (const s of initialSettings) {
    insertSetting.run(s.key, s.value);
  }

  const initialPages = [
    { id: 'iletisim', title: 'İletişim', content: 'Bize fuegowholesale@gmail.com adresinden ulaşabilirsiniz.', seoTitle: 'İletişim - Fuego Toptan', seoDescription: 'Fuego Toptan iletişim bilgileri.', slug: 'iletisim' },
    { id: 'sss', title: 'Sıkça Sorulan Sorular', content: `**Minimum sipariş adeti var mı?**
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
Evet, büyük adetli ve özel üretim siparişleri için bizimle iletişime geçin.`, seoTitle: 'Sıkça Sorulan Sorular - Fuego Toptan', seoDescription: 'Fuego Toptan hakkında merak edilenler.', slug: 'sss' },
    { id: 'hakkimizda', title: 'Hakkımızda', content: 'Fuego Toptan olarak 2026 yılından beri hizmet vermekteyiz.', seoTitle: 'Hakkımızda - Fuego Toptan', seoDescription: 'Fuego Toptan hikayesi.', slug: 'hakkimizda' }
  ];

  const insertPage = db.prepare("INSERT OR REPLACE INTO pages (id, title, content, seoTitle, seoDescription, slug) VALUES (?, ?, ?, ?, ?, ?)");
  for (const pg of initialPages) {
    insertPage.run(pg.id, pg.title, pg.content, pg.seoTitle, pg.seoDescription, pg.slug);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Media Upload Route with Sharp processing
  app.post("/api/upload", upload.array("files"), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    const mediaItems = [];

    for (const file of files) {
      if (file.mimetype.startsWith("image")) {
        const webpFilename = `${path.parse(file.filename).name}.webp`;
        const webpPath = path.join(uploadDir, webpFilename);
        
        await sharp(file.path)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        // Remove original file
        fs.unlinkSync(file.path);
        
        mediaItems.push({
          type: "image",
          url: `/uploads/${webpFilename}`
        });
      } else {
        mediaItems.push({
          type: "video",
          url: `/uploads/${file.filename}`
        });
      }
    }
    res.json(mediaItems);
  });

  // API Routes
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products ORDER BY orderIndex ASC").all();
      res.json(products.map((p: any) => ({
        ...p,
        category: p.category && (p.category.startsWith('[') || p.category.startsWith('{')) ? JSON.parse(p.category) : p.category,
        sizes: p.sizes ? JSON.parse(p.sizes) : [],
        colors: p.colors ? JSON.parse(p.colors) : [],
        media: p.media ? JSON.parse(p.media) : [],
        isNew: !!p.isNew
      })));
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post("/api/products", (req, res) => {
    const p = req.body;
    const id = p.id || `fuego-${Date.now()}`;
    try {
      db.prepare(`
        INSERT OR REPLACE INTO products (id, name, category, pricePerPiece, piecesPerSeries, sizes, colors, media, isNew, fabricInfo, status, colorCount, orderIndex, seoTitle, seoDescription, slug)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, p.name, typeof p.category === 'string' ? p.category : JSON.stringify(p.category || []), p.pricePerPiece, p.piecesPerSeries, 
        JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), JSON.stringify(p.media || []), 
        p.isNew ? 1 : 0, p.fabricInfo || '', p.status || 'Yayında', String(p.colorCount || '0'), p.orderIndex || 0,
        p.seoTitle || '', p.seoDescription || '', p.slug || ''
      );
      res.json({ success: true, id });
    } catch (err) {
      console.error('Error saving product:', err);
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  app.post("/api/products/order", (req, res) => {
    const { productId, direction } = req.body;
    try {
      // Get all products ordered by orderIndex, then by id as a fallback
      const products = db.prepare("SELECT id, orderIndex FROM products ORDER BY orderIndex ASC, id ASC").all();
      const currentIndex = products.findIndex((p: any) => p.id === productId);
      
      if (currentIndex === -1) return res.status(404).json({ error: 'Product not found' });
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < products.length) {
        // Swap in the array
        const temp = products[currentIndex];
        products[currentIndex] = products[targetIndex];
        products[targetIndex] = temp;
        
        // Apply new indices to all to ensure they are unique and sequential
        const update = db.prepare("UPDATE products SET orderIndex = ? WHERE id = ?");
        const transaction = db.transaction((prods) => {
          prods.forEach((p: any, idx: number) => {
            update.run(idx, p.id);
          });
        });
        transaction(products);
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Order update error:', err);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Media Cleanup logic
  const deletionQueue: { path: string, deleteAt: number }[] = [];

  app.delete("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT media FROM products WHERE id = ?").get(req.params.id) as any;
    if (product && product.media) {
      const media = JSON.parse(product.media);
      media.forEach((m: any) => {
        if (m.url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, m.url);
          deletionQueue.push({ path: filePath, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });
        }
      });
    }
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
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

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, s: any) => {
      try {
        acc[s.key] = JSON.parse(s.value);
      } catch {
        acc[s.key] = s.value;
      }
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    const update = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(settings)) {
      const val = typeof value === 'object' ? JSON.stringify(value) : value;
      update.run(key, val as string);
    }
    res.json({ success: true });
  });

  // Pages Routes
  app.get("/api/pages", (req, res) => {
    const pages = db.prepare("SELECT * FROM pages").all();
    res.json(pages);
  });

  app.post("/api/pages", (req, res) => {
    const pg = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO pages (id, title, content, seoTitle, seoDescription, slug)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(pg.id, pg.title, pg.content, pg.seoTitle, pg.seoDescription, pg.slug);
    res.json({ success: true });
  });

  // Export/Import Routes
  app.get("/api/export", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    const settings = db.prepare("SELECT * FROM settings").all();
    const pages = db.prepare("SELECT * FROM pages").all();
    res.json({ products, settings, pages });
  });

  app.post("/api/import", (req, res) => {
    const { products, settings, pages } = req.body;
    
    try {
      const runImport = db.transaction(() => {
        if (products) {
          db.prepare("DELETE FROM products").run();
          const insert = db.prepare(`
            INSERT INTO products (id, name, category, pricePerPiece, piecesPerSeries, sizes, colors, media, isNew, fabricInfo, status, colorCount, orderIndex, seoTitle, seoDescription, slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const p of products) {
            insert.run(p.id, p.name, p.category, p.pricePerPiece, p.piecesPerSeries, p.sizes, p.colors, p.media, p.isNew, p.fabricInfo, p.status, p.colorCount, p.orderIndex, p.seoTitle, p.seoDescription, p.slug);
          }
        }
        if (settings) {
          db.prepare("DELETE FROM settings").run();
          const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
          for (const s of settings) {
            insert.run(s.key, s.value);
          }
        }
        if (pages) {
          db.prepare("DELETE FROM pages").run();
          const insert = db.prepare("INSERT INTO pages (id, title, content, seoTitle, seoDescription, slug) VALUES (?, ?, ?, ?, ?, ?)");
          for (const pg of pages) {
            insert.run(pg.id, pg.title, pg.content, pg.seoTitle, pg.seoDescription, pg.slug);
          }
        }
      });
      
      runImport();
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();