import { formatRupiah } from "./format";

// Manual rate — update this number whenever the real rate moves.
// This is a DISPLAY-ONLY estimate. QRIS payment is always settled in IDR;
// this just helps foreign buyers gauge the price in USD.
export const USD_IDR_RATE = 18300;

export function formatUsdEstimate(amountIdr: number): string {
  const usd = amountIdr / USD_IDR_RATE;
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats a price for display based on language.
 * - "id": just the Rupiah amount (e.g. "Rp150.000")
 * - "en": Rupiah amount + USD estimate (e.g. "Rp150.000 (~$8.20)")
 *   The IDR amount is still the real, actually-charged amount.
 */
export function formatPrice(amountIdr: number, lang: "id" | "en"): string {
  const idr = formatRupiah(amountIdr);
  if (lang === "en") {
    return `${idr} (~${formatUsdEstimate(amountIdr)})`;
  }
  return idr;
}
