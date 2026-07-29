import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haiz Store",
  description: "Toko akun Blox Fruit & Robux terpercaya, pengiriman instant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />