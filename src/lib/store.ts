import { redis } from "./redis";
import { hashPassword, randomHex } from "./auth-server";
import { Product, StoreConfig, Category } from "./types";

interface AdminUser {
  username: string;
  passwordHash: string;
  salt: string;
}

const KEYS = {
  products: "haizstore:products",
  config: "haizstore:config",
  admin: "haizstore:admin",
  categories: "haizstore:categories",
};

const DEFAULT_CONFIG: StoreConfig = {
  storeName: "Haiz Store",
  whatsapp: "6281234567890",
  linktreeUrl: "https://linktr.ee/haizstre",
  tiktokUrl: "https://www.tiktok.com/@haiz_store26/photo/7489606772441845000",
  instagramUrl: "https://www.instagram.com/p/DHBbUf1zoCQ/",
  qrisImage: "/images/qris.png",
  mascotImage: "/images/mascot.png",
  heroTitle: "Akun Game Terpercaya, Kirim Instant",
  heroSub: "Proses otomatis, aman, dan bergaransi. Konfirmasi via WhatsApp.",
  announcement:
    "Pengiriman akun otomatis & instant. Setelah transfer, konfirmasi via WhatsApp beserta bukti transfer.",
  testimoniTitle: "Testimoni Pelanggan",
  testimoniText: "Lihat testimoni kami di sosial media:",
};

const SEED_PRODUCTS: Product[] = [
  {
    id: "godhuman01",
    name: "Akun Blox Fruit GODHUMAN [Level MAX] Blox Fruits Anti Hackback",
    price: 9900,
    image: "/images/produk1.png",
    stock: 50,
    sold: 620,
    minBuy: 1,
    description:
      'Spek Akun:\n- Level MAX "Update27.5" 2800\n- V2 Melee Lengkap\n- Bonus 1-9 Legendary Sword\n- Bonus Awaken / Rare / Myth / Uncommon / Common Fruit\n- Bonus Hallow Scythe (Jika Beruntung)\n- Bonus Aksesoris di Inventory\n- Bonus Belly\n\nPengiriman Akun Otomatis, Cek Riwayat Pesanan untuk info data akun nya.',
    active: true,
    availability: "in_stock",
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "ghoulv4full",
    name: "Akun Blox Fruit Race Ghoul V4 Full Gear (Awakening) (Godhuman + CDK) [Level MAX]",
    price: 39000,
    image: "/images/produk2.png",
    stock: 30,
    sold: 331,
    minBuy: 1,
    description:
      'Spek Akun:\n- GHOUL V4 FULL GEAR (AWAKENING)\n- Level MAX "Update27.5" 2800\n- Melee V2 Lengkap [Godhuman, Dragon Talon, Electric Claw, Death Step, Sharkmen Karate]\n- Melee V1 Lengkap [Superhuman, Dragon Breath, Dark Step, Electro, Fishmen Karate]\n- Bonus 1-9 Legendary Sword\n- Bonus 1-3 Mythical Sword (Pasti dapat CDK)\n- Bonus Fruit (Mythical / Rare / Uncommon / Common)\n- Bonus Belly\n\nAkun dijamin aman, silahkan dicek reviewnya. Pengiriman Akun Otomatis, rata-rata kirim 20 menit.',
    active: true,
    availability: "in_stock",
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ---- Products ----

export async function getAllProducts(): Promise<Product[]> {
  const data = await redis.get<Product[]>(KEYS.products);
  if (!data) {
    await redis.set(KEYS.products, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }
  // Ensure order field exists
  return data.map((p, i) => ({ ...p, order: p.order ?? i }));
}

export async function getActiveProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.id === id) || null;
}

export async function upsertProduct(product: Product): Promise<Product> {
  const all = await getAllProducts();
  const idx = all.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    all[idx] = product;
  } else {
    // Auto assign order at end
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order ?? 0), -1);
    product.order = maxOrder + 1;
    all.push(product);
  }
  await redis.set(KEYS.products, all);
  return product;
}

export async function saveAllProducts(products: Product[]): Promise<void> {
  await redis.set(KEYS.products, products);
}

export async function deleteProduct(id: string): Promise<void> {
  const all = await getAllProducts();
  await redis.set(
    KEYS.products,
    all.filter((p) => p.id !== id)
  );
}

// ---- Categories ----

export async function getAllCategories(): Promise<Category[]> {
  const data = await redis.get<Category[]>(KEYS.categories);
  if (!data) return [];
  return data.sort((a, b) => a.order - b.order);
}

export async function saveAllCategories(categories: Category[]): Promise<void> {
  await redis.set(KEYS.categories, categories);
}

// ---- Config ----

export async function getConfig(): Promise<StoreConfig> {
  const data = await redis.get<StoreConfig>(KEYS.config);
  if (!data) {
    await redis.set(KEYS.config, DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  // Merge with defaults so new fields are always present
  const merged = { ...DEFAULT_CONFIG, ...data };
  return merged;
}

export async function setConfig(config: StoreConfig): Promise<void> {
  await redis.set(KEYS.config, config);
}

// ---- Admin ----

export async function getAdmin(): Promise<AdminUser | null> {
  const data = await redis.get<AdminUser>(KEYS.admin);
  if (data) return data;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;

  const salt = randomHex(16);
  const admin: AdminUser = {
    username,
    salt,
    passwordHash: hashPassword(password, salt),
  };
  await redis.set(KEYS.admin, admin);
  return admin;
}

export async function setAdmin(admin: AdminUser): Promise<void> {
  await redis.set(KEYS.admin, admin);
}

export type { AdminUser };
