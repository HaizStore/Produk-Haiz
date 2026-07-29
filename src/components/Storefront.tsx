"use client";

import { useState } from "react";
import { Product, StoreConfig, Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import BuyModal from "./BuyModal";
import Testimonials from "./Testimonials";

export default function Storefront({
  products,
  config,
  categories,
}: {
  products: Product[];
  config: StoreConfig;
  categories: Category[];
}) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");

  const filteredProducts = activeCat === "all" 
    ? products 
    : products.filter(p => p.categoryId === activeCat);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <img src={config.mascotImage} alt={config.storeName} />
            {config.storeName}
          </div>
          <div className="header-links">
            <a className="pill-btn" href={config.linktreeUrl} target="_blank" rel="noopener noreferrer">🔗 Komunitas</a>
            <a className="pill-btn solid" href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="hero">
          <h1 className="hero-title">{config.heroTitle}</h1>
          <p className="hero-sub">{config.heroSub}</p>
          {config.announcement && <div className="announcement">{config.announcement}</div>}
        </div>

        <div className="tabs" style={{ gap: 8, marginTop: 20 }}>
          <button className={`tab ${activeCat === "all" ? "active" : ""}`} onClick={() => setActiveCat("all")}>Semua Produk</button>
          {categories.map(c => (
            <button key={c.id} className={`tab ${activeCat === c.id ? "active" : ""}`} onClick={() => setActiveCat(c.id)}>{c.name}</button>
          ))}
        </div>

        <div className="grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onBuy={setSelected} />
          ))}
        </div>
        
        <Testimonials config={config} />
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} {config.storeName} · Semua transaksi diproses manual & aman
      </footer>

      {selected && (
        <BuyModal
          product={selected}
          config={config}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
