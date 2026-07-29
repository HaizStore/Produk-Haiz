import { getActiveProducts, getConfig, getAllCategories } from "@/lib/store";
import Storefront from "@/components/Storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, config, categories] = await Promise.all([
    getActiveProducts(),
    getConfig(),
    getAllCategories()
  ]);
  return <Storefront products={products} config={config} categories={categories} />;
}
