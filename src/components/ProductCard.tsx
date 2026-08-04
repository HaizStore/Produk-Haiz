"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({
  product,
  onBuy,
}: {
  product: Product;
  onBuy: (p: Product) => void;
}) {
  const availability = product.availability || "in_stock";
  const isAvailable = availability === "in_stock";
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card">
      <Link href={`/product/${product.id}`} style={{ display: 'contents' }}>
        <img src={product.image} alt={product.name} className="card-img" />
        <div className="card-body">
          <div className="card-name">{product.name}</div>
          <div className="card-price">{formatRupiah(product.price)}</div>
          <div className="card-meta">
            <span>Terjual {product.sold}</span>
            <span style={isAvailable && product.stock <= 3 ? { color: "var(--red)", fontWeight: 700 } : undefined}>
              Stok {isAvailable ? product.stock : 0}
              {isAvailable && product.stock <= 3 ? " (Hampir Habis!)" : ""}
            </span>
            <span className={`badge-stock ${isAvailable ? "in" : "out"}`}>
              {isAvailable ? "Tersedia" : availability === "pre_order" ? "Pre-Order" : "Habis"}
            </span>
          </div>
        </div>
      </Link>

      <div className="card-actions" style={{ padding: '0 16px 16px 16px', display: 'flex', gap: '8px' }}>
        <Link href={`/product/${product.id}`} className="btn" style={{ flex: 1, textAlign: 'center' }}>
          Detail
        </Link>
        <button
          className="btn primary"
          style={{ flex: 1 }}
          disabled={!isAvailable && availability !== "pre_order"}
          onClick={(e) => { e.stopPropagation(); onBuy(product); }}
        >
          {isAvailable ? "Beli" : availability === "pre_order" ? "Pre-Order" : "Habis"}
        </button>
        <button
          className={`btn cart-add-btn ${added ? "added" : ""}`}
          disabled={!isAvailable}
          onClick={handleAddToCart}
          title="Tambah ke keranjang"
          aria-label="Tambah ke keranjang"
        >
          {added ? "✓" : "🛒"}
        </button>
      </div>
    </div>
  );
}
