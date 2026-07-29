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
  const [search, setSearch] = useState("");
  const [layoutMode, setLayoutMode] = useState<"navbar" | "sidebar">("navbar");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredProducts = products
    .filter((p) => (activeCat === "all" ? true : p.categoryId === activeCat))
    .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const toggleLayout = () => {
    setLayoutMode((m) => (m === "navbar" ? "sidebar" : "navbar"));
    setSidebarOpen(false);
  };

  const catButtonClass = (id: string, vertical: boolean) => {
    const active = activeCat === id;
    return vertical
      ? `sidebar-cat ${active ? "active" : ""}`
      : `tab ${active ? "active" : ""}`;
  };

  const CategoryList = ({ vertical = false }: { vertical?: boolean }) => (
    <>
      <button
        className={catButtonClass("all", vertical)}
        onClick={() => {
          setActiveCat("all");
          setSidebarOpen(false);
        }}
      >
        Semua Produk
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={catButtonClass(c.id, vertical)}
          onClick={() => {
            setActiveCat(c.id);
            setSidebarOpen(false);
          }}
        >
          {c.name}
        </button>
      ))}
    </>
  );

  const ProductGrid = () => (
    <>
      {filteredProducts.length > 0 ? (
        <div className="grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onBuy={setSelected} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Produk “{search}” tidak ditemukan.
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-left">
            <button
              className="hamburger-btn"
              onClick={toggleLayout}
              aria-label="Ganti tampilan"
              title={
                layoutMode === "navbar"
                  ? "Klik untuk tampilan sidebar"
                  : "Klik untuk tampilan navbar"
              }
            >
              <span />
              <span />
              <span />
            </button>
            <div className="brand">
              <img src={config.mascotImage} alt={config.storeName} />
              {config.storeName}
            </div>
          </div>
          <div className="header-links">
            <a className="pill-btn" href={config.linktreeUrl} target="_blank" rel="noopener noreferrer">
              🔗 Komunitas
            </a>
            <a className="pill-btn solid" href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="hero">
          <h1 className="hero-title">{config.heroTitle}</h1>
          <p className="hero-sub">{config.heroSub}</p>
          {config.announcement && <div className="announcement">{config.announcement}</div>}
        </div>

        <div className="search-bar">
          <span aria-hidden>🔍</span>
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} aria-label="Hapus pencarian">
              ✕
            </button>
          )}
        </div>

        {layoutMode === "navbar" ? (
          <>
            <div className="tabs tabs-wrap" style={{ marginTop: 20 }}>
              <CategoryList />
            </div>
            <ProductGrid />
          </>
        ) : (
          <div className="layout-with-sidebar" style={{ marginTop: 20 }}>
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <div className="sidebar-title">Kategori</div>
              <CategoryList vertical />
            </aside>

            <div>
              <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
                ☰ Kategori
              </button>
              <ProductGrid />
            </div>
          </div>
        )}

        <Testimonials config={config} />
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} {config.storeName} · Semua transaksi diproses manual & aman
      </footer>

      {selected && <BuyModal product={selected} config={config} onClose={() => setSelected(null)} />}
    </>
  );
}
