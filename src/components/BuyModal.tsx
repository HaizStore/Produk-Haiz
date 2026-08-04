"use client";

import { useState } from "react";
import { Product, StoreConfig } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

export default function BuyModal({
  product,
  config,
  onClose,
}: {
  product: Product;
  config: StoreConfig;
  onClose: () => void;
}) {
  const minQty = Math.max(1, product.minBuy || 1);
  const maxQty = product.stock > 0 ? product.stock : 999;
  const [qty, setQty] = useState(minQty);

  const totalPrice = product.price * qty;

  const waMessage = encodeURIComponent(
    `Halo ${config.storeName}, saya mau pesan:\n"${product.name}" x${qty} (${formatRupiah(
      totalPrice
    )})\nMohon dicek dan dikirim produknya. Terima kasih!`
  );
  const waLink = `https://wa.me/${config.whatsapp}?text=${waMessage}`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <button className="close-x" onClick={onClose}>✕</button>
        <h3 style={{ margin: "4px 0 2px", fontSize: 16 }}>{product.name}</h3>
        <div style={{ color: "var(--gold-bright)", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
          {formatRupiah(product.price)} <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500 }}>/ unit</span>
        </div>

        <div className="qty-selector">
          <span className="qty-label">Jumlah</span>
          <div className="qty-controls">
            <button type="button" onClick={() => setQty((q) => Math.max(minQty, q - 1))} disabled={qty <= minQty} aria-label="Kurangi">
              −
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Tambah">
              +
            </button>
          </div>
        </div>
        {product.minBuy > 1 && (
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Min. pembelian {product.minBuy}</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0" }}>
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Total</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold-bright)" }}>{formatRupiah(totalPrice)}</span>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.qrisImage} alt="QRIS" className="qris" />

        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
          1. Scan QRIS di atas menggunakan e-wallet / mobile banking
          <br />
          2. Bayar sesuai nominal <b>{formatRupiah(totalPrice)}</b>
          <br />
          3. Klik tombol di bawah untuk konfirmasi via WhatsApp
        </p>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
          style={{ display: "block", marginTop: 10 }}
        >
          Konfirmasi via WhatsApp
        </a>
      </div>
    </div>
  );
}
