"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, StoreConfig } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useLanguage } from "@/lib/i18n";
import BuyModal from "./BuyModal";
import LanguageSwitcher from "./LanguageSwitcher";

export default function ProductDetail({
  product,
  config,
}: {
  product: Product;
  config: StoreConfig;
}) {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLanguage();
  const availability = product.availability || "in_stock";
  const isAvailable = availability === "in_stock";
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <img src={config.mascotImage} alt={config.storeName} />
            {config.storeName}
          </Link>
          <div className="header-links">
            <LanguageSwitcher />
            <Link href="/" className="pill-btn">
              {t("nav_back")}
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="detail-wrap">
          <div>
            <div style={{ position: "relative" }}>
              <img src={product.image} alt={product.name} className="detail-img" />
              {hasDiscount && <span className="discount-badge">-{discountPercent}%</span>}
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>{product.name}</h1>
            <div style={{ fontSize: 26, fontWeight: 800 }}>
              {hasDiscount && (
                <span className="detail-price-original">{formatPrice(product.originalPrice!, lang)}</span>
              )}
              <span className={hasDiscount ? "detail-price-discounted" : ""} style={!hasDiscount ? { color: "var(--gold-bright)" } : undefined}>
                {formatPrice(product.price, lang)}
              </span>
            </div>
            <div className="card-meta" style={{ margin: "10px 0" }}>
              <span>{t("detail_min_buy")} {product.minBuy}</span>
              <span>{t("card_sold")} {product.sold}</span>
              <span style={isAvailable && product.stock <= 3 ? { color: "var(--red)", fontWeight: 700 } : undefined}>
                {t("card_stock")} {isAvailable ? product.stock : 0}
                {isAvailable && product.stock <= 3 ? t("card_low_stock") : ""}
              </span>
              <span className={`badge-stock ${isAvailable ? "in" : "out"}`}>
                {isAvailable ? t("card_available") : availability === "pre_order" ? t("card_preorder") : t("card_soldout")}
              </span>
            </div>
            <button
              className="btn primary"
              style={{ width: "100%", padding: 14 }}
              disabled={!isAvailable && availability !== "pre_order"}
              onClick={() => setOpen(true)}
            >
              {isAvailable ? t("detail_buy_now") : availability === "pre_order" ? t("detail_preorder_now") : t("detail_out_of_stock")}
            </button>
            <div className="detail-desc">
              {lang === "en" && product.descriptionEn ? product.descriptionEn : product.description}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <BuyModal product={product} config={config} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
