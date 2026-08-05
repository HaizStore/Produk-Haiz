export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  sold: number;
  minBuy: number;
  description: string;
  descriptionEn?: string;
  active: boolean;
  availability?: "in_stock" | "pre_order";
  categoryId?: string;
  order?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface StoreConfig {
  storeName: string;
  whatsapp: string;
  linktreeUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  qrisImage: string;
  mascotImage: string;
  heroTitle: string;
  heroSub: string;
  announcement: string;
  testimoniTitle: string;
  testimoniText: string;
}
