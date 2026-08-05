"use client";

import { CartItem, useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import { StoreConfig } from "@/lib/types";

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLanguage();
  const name = useAutoTranslate(item.product.name);

  return (
    <div className="cart-item">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.product.image} alt={item.product.name} />
      <div className="cart-item-info">
        <div className="cart-item-name">{name}</div>
        <div className="cart-item-price">{formatRupiah(item.product.price)}</div>
        <div className="cart-item-qty">
          <button onClick={() => onUpdateQty(item.product.id, item.qty - 1)} aria-label="Kurangi">−</button>
          <span>{item.qty}</span>
          <button
            onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
            disabled={item.product.stock > 0 && item.qty >= item.product.stock}
            aria-label="Tambah"
          >
            +
          </button>
          <button className="cart-item-remove" onClick={() => onRemove(item.product.id)}>
            {t("cart_remove")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({
  config,
  onClose,
}: {
  config: StoreConfig;
  onClose: () => void;
}) {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();

  // WA message to the seller always stays in Indonesian regardless of UI language
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
        <h3 style={{ marginTop: 4, marginBottom: 16 }}>{t("cart_title")}</h3>

        {items.length === 0 ? (
          <div className="empty-state">{t("cart_empty")}</div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((i) => (
                <CartItemRow key={i.product.id} item={i} onUpdateQty={updateQty} onRemove={removeItem} />
              ))}
            </div>

            <div className="cart-total">
              <span>{t("cart_total")}</span>
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
              {t("cart_checkout")}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
