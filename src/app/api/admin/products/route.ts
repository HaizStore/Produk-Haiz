import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, upsertProduct } from "@/lib/store";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
import { randomHex } from "@/lib/auth-server";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

function validate(p: Partial<Product>): string | null {
  if (!p.name || !p.name.trim()) return "name is required";
  if (p.name.length > 200) return "name too long";
  if (p.description && p.description.length > 5000) return "description too long";
  if (typeof p.price !== "number" || p.price < 0) return "price must be >= 0";
  if (typeof p.stock !== "number" || p.stock < 0) return "stock must be >= 0";
  return null;
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  const products = await getAllProducts();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: Partial<Product>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const now = Date.now();
  const product: Product = {
    id: randomHex(8),
    name: body.name!.trim(),
    price: body.price!,
    image: body.image || "",
    stock: body.stock ?? 0,
    sold: body.sold ?? 0,
    minBuy: body.minBuy && body.minBuy > 0 ? body.minBuy : 1,
    description: body.description || "",
    active: body.active ?? true,
    categoryId: body.categoryId,
    availability: (body.availability as "in_stock" | "pre_order") || "in_stock",
    createdAt: now,
    updatedAt: now,
  };

  await upsertProduct(product);
  return NextResponse.json(product, { status: 201 });
}
