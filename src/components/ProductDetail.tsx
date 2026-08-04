"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, StoreConfig } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import BuyModal from "./BuyModal";

export default function ProductDetail({
  product,
  config,
}: {
  product: Product;
  config: StoreConfig;
}) {
  const [open, setOpen] = useState(false);
  const availability = product.availability || "in_stock";
  const isAvailable = availability === "in_stock";

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <img src={config.mascotImage} alt={config.storeName} />
            {config.storeName}
          </Link>
          <div className="header-links">
            <Link href="/" className="pill-btn">
              ← Kembali
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="detail-wrap">
          <div>
            <img src={product.image} alt={product.name} className="detail-img" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>{product.name}</h1>
            <div style={{ color: "var(--gold-bright)", fontSize: 26, fontWeight: 800 }}>
              {formatRupiah(product.price)}
            </div>
            <div className="card-meta" style={{ margin: "10px 0" }}>
              <span>Min. beli {product.minBuy}</span>
              <span>Terjual {product.sold}</span>
              <span style={isAvailable && product.stock <= 3 ? { color: "var(--red)", fontWeight: 700 } : undefined}>
                Stok {isAvailable ? product.stock : 0}
                {isAvailable && product.stock <= 3 ? " (Hampir Habis!)" : ""}
              </span>
              <span className={`badge-stock ${isAvailable ? "in" : "out"}`}>
                {isAvailable ? "Tersedia" : availability === "pre_order" ? "Pre-Order" : "Habis"}
              </span>
            </div>
            <button
              className="btn primary"
              style={{ width: "100%", padding: 14 }}
              disabled={!isAvailable && availability !== "pre_order"}
              onClick={() => setOpen(true)}
            >
              {isAvailable ? "Beli Sekarang" : availability === "pre_order" ? "Pre-Order Sekarang" : "Stok Habis"}
            </button>
            <div className="detail-desc">{product.description}</div>
          </div>
        </div>
      </div>

      {open && (
        <BuyModal product={product} config={config} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
