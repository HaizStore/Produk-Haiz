import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getActiveProducts();
  return NextResponse.json(products);
}
