"use client";

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
  const waMessage = encodeURIComponent(
    `Halo ${config.storeName}, saya mau pesan:\n"${product.name}" (${formatRupiah(
      product.price
    )})\nMohon dicek dan dikirim produknya. Terima kasih!`
  );
  const waLink = `https://wa.me/${config.whatsapp}?text=${waMessage}`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <button className="close-x" onClick={onClose}>✕</button>
        <h3 style={{ margin: "4px 0 2px", fontSize: 16 }}>{product.name}</h3>
        <div style={{ color: "var(--gold-bright)", fontWeight: 800, fontSize: 20, marginBottom: 14 }}>
          {formatRupiah(product.price)}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.qrisImage} alt="QRIS" className="qris" />

        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
          1. Scan QRIS di atas menggunakan e-wallet / mobile banking
          <br />
          2. Bayar sesuai nominal <b>{formatRupiah(product.price)}</b>
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