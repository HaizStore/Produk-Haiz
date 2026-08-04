"use client";

import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";
import { StoreConfig } from "@/lib/types";

export default function CartDrawer({
  config,
  onClose,
}: {
  config: StoreConfig;
  onClose: () => void;
}) {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();

  const waMessage = encodeURIComponent(
    `Halo ${config.storeName}, saya mau pesan:\n\n` +
      items
        .map((i) => `- ${i.product.name} x${i.qty} (${formatRupiah(i.product.price * i.qty)})`)
        .join("\n") +
      `\n\nTotal: ${formatRupiah(totalPrice)}\n\nMohon dicek dan dikirim produknya. Terima kasih!`
  );
  const waLink = `https://wa.me/${config.whatsapp}?text=${waMessage}`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal cart-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>✕</button>
        <h3 style={{ marginTop: 4, marginBottom: 16 }}>Keranjang Belanja</h3>

        {items.length === 0 ? (
          <div className="empty-state">Keranjang kamu masih kosong.</div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((i) => (
                <div className="cart-item" key={i.product.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.product.image} alt={i.product.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{i.product.name}</div>
                    <div className="cart-item-price">{formatRupiah(i.product.price)}</div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQty(i.product.id, i.qty - 1)} aria-label="Kurangi">−</button>
                      <span>{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.product.id, i.qty + 1)}
                        disabled={i.product.stock > 0 && i.qty >= i.product.stock}
                        aria-label="Tambah"
                      >
                        +
                      </button>
                      <button className="cart-item-remove" onClick={() => removeItem(i.product.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
              style={{ display: "block", marginTop: 12, textAlign: "center" }}
              onClick={() => setTimeout(clearCart, 800)}
            >
              Checkout via WhatsApp
            </a>
          </>
        )}
      </div>
    </div>
  );
}
