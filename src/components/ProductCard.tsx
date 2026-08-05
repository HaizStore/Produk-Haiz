"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/i18n";

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
  const { lang, t } = useLanguage();
  const [added, setAdded] = useState(false);

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

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
        <div className="card-img-wrap">
          <img src={product.image} alt={product.name} className="card-img" />
          {hasDiscount && <span className="discount-badge">-{discountPercent}%</span>}
        </div>
        <div className="card-body">
          <div className="card-name">{product.name}</div>
          <div className="card-price">
            {hasDiscount && (
              <span className="card-price-original">{formatPrice(product.originalPrice!, lang)}</span>
            )}
            <span className={hasDiscount ? "card-price-discounted" : undefined}>
              {formatPrice(product.price, lang)}
            </span>
          </div>
          <div className="card-meta">
            <span>{t("card_sold")} {product.sold}</span>
            <span style={isAvailable && product.stock <= 3 ? { color: "var(--red)", fontWeight: 700 } : undefined}>
              {t("card_stock")} {isAvailable ? product.stock : 0}
              {isAvailable && product.stock <= 3 ? t("card_low_stock") : ""}
            </span>
            <span className={`badge-stock ${isAvailable ? "in" : "out"}`}>
              {isAvailable ? t("card_available") : availability === "pre_order" ? t("card_preorder") : t("card_soldout")}
            </span>
          </div>
        </div>
      </Link>

      <div className="card-actions" style={{ padding: '0 16px 16px 16px', display: 'flex', gap: '8px' }}>
        <Link href={`/product/${product.id}`} className="btn" style={{ flex: 1, textAlign: 'center' }}>
          {t("card_detail")}
        </Link>
        <button
          className="btn primary"
          style={{ flex: 1 }}
          disabled={!isAvailable && availability !== "pre_order"}
          onClick={(e) => { e.stopPropagation(); onBuy(product); }}
        >
          {isAvailable ? t("card_buy") : availability === "pre_order" ? t("card_preorder") : t("card_soldout")}
        </button>
        <button
          className={`btn cart-add-btn ${added ? "added" : ""}`}
          disabled={!isAvailable}
          onClick={handleAddToCart}
          title={t("card_add_to_cart")}
          aria-label={t("card_add_to_cart")}
        >
          {added ? "✓" : "🛒"}
        </button>
      </div>
    </div>
  );
}
