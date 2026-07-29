import { notFound } from "next/navigation";
import { getActiveProducts, getConfig } from "@/lib/store";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [products, config] = await Promise.all([getActiveProducts(), getConfig()]);
  const product = products.find((p) => p.id === params.id);
  if (!product) return notFound();
  return <ProductDetail product={product} config={config} />;
}
