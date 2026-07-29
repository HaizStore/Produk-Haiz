import { NextRequest, NextResponse } from "next/server";
import { getProductById, upsertProduct, deleteProduct } from "@/lib/store";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  const existing = await getProductById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  let body: Partial<Product>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const updated: Product = {
    ...existing,
    name: body.name!.trim(),
    price: body.price!,
    image: body.image ?? existing.image,
    stock: body.stock ?? existing.stock,
    sold: body.sold ?? existing.sold,
    minBuy: body.minBuy && body.minBuy > 0 ? body.minBuy : existing.minBuy,
    description: body.description ?? existing.description,
    active: body.active ?? existing.active,
    categoryId: body.categoryId ?? existing.categoryId,
    availability: (body.availability as "in_stock" | "pre_order") || existing.availability || "in_stock",
    updatedAt: Date.now(),
  };

  await upsertProduct(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  const existing = await getProductById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
  }

  await deleteProduct(params.id);
  return NextResponse.json({ status: "deleted" });
}
