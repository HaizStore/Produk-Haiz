"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "id" | "en";

const STORAGE_KEY = "haiz_lang";

const dict = {
  search_placeholder: { id: "Cari produk...", en: "Search products..." },
  category_all: { id: "Semua Produk", en: "All Products" },
  category_label: { id: "Kategori", en: "Category" },
  mobile_category_toggle: { id: "☰ Kategori", en: "☰ Category" },
  not_found_prefix: { id: "Produk ", en: "Product " },
  not_found_suffix: { id: " tidak ditemukan.", en: " not found." },

  nav_community: { id: "🔗 Komunitas", en: "🔗 Community" },
  nav_whatsapp: { id: "💬 WhatsApp", en: "💬 WhatsApp" },
  nav_cart: { id: "🛒 Keranjang", en: "🛒 Cart" },
  nav_back: { id: "← Kembali", en: "← Back" },

  card_sold: { id: "Terjual", en: "Sold" },
  card_stock: { id: "Stok", en: "Stock" },
  card_low_stock: { id: " (Hampir Habis!)", en: " (Almost Gone!)" },
  card_available: { id: "Tersedia", en: "Available" },
  card_preorder: { id: "Pre-Order", en: "Pre-Order" },
  card_soldout: { id: "Habis", en: "Sold Out" },
  card_detail: { id: "Detail", en: "Details" },
  card_buy: { id: "Beli", en: "Buy" },
  card_add_to_cart: { id: "Tambah ke keranjang", en: "Add to cart" },

  detail_min_buy: { id: "Min. beli", en: "Min. order" },
  detail_buy_now: { id: "Beli Sekarang", en: "Buy Now" },
  detail_preorder_now: { id: "Pre-Order Sekarang", en: "Pre-Order Now" },
  detail_out_of_stock: { id: "Stok Habis", en: "Out of Stock" },

  buy_qty: { id: "Jumlah", en: "Quantity" },
  buy_min: { id: "Min. pembelian", en: "Min. purchase" },
  buy_total: { id: "Total", en: "Total" },
  buy_per_unit: { id: "/ unit", en: "/ unit" },
  buy_step1: { id: "Scan QRIS di atas menggunakan e-wallet / mobile banking", en: "Scan the QRIS above using an e-wallet / mobile banking app" },
  buy_step2: { id: "Bayar sesuai nominal", en: "Pay the exact amount of" },
  buy_step3: { id: "Klik tombol di bawah untuk konfirmasi via WhatsApp", en: "Tap the button below to confirm via WhatsApp" },
  buy_confirm: { id: "Konfirmasi via WhatsApp", en: "Confirm via WhatsApp" },
  buy_idr_note: { id: "Pembayaran QRIS diproses dalam Rupiah (IDR). Nilai USD di atas hanya estimasi.", en: "QRIS payment is processed in Indonesian Rupiah (IDR). The USD value above is only an estimate." },

  cart_title: { id: "Keranjang Belanja", en: "Shopping Cart" },
  cart_empty: { id: "Keranjang kamu masih kosong.", en: "Your cart is empty." },
  cart_remove: { id: "Hapus", en: "Remove" },
  cart_total: { id: "Total", en: "Total" },
  cart_checkout: { id: "Checkout via WhatsApp", en: "Checkout via WhatsApp" },

  footer_note: { id: "Semua transaksi diproses manual & aman", en: "All transactions are processed manually & safely" },
} as const;

export type TranslationKey = keyof typeof dict;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "id" || saved === "en") setLangState(saved);
    } catch {
      // ignore
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }

  function t(key: TranslationKey): string {
    return dict[key][lang];
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
