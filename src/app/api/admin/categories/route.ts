import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, saveAllCategories } from "@/lib/store";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
import { Category } from "@/lib/types";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: { name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const categories = await getAllCategories();
  const newCat: Category = {
    id: crypto.randomBytes(8).toString("hex"),
    name: body.name.trim(),
    order: categories.length,
  };
  categories.push(newCat);
  await saveAllCategories(categories);
  return NextResponse.json(newCat, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: Category[];
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  await saveAllCategories(body);
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: { id?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const categories = await getAllCategories();
  await saveAllCategories(categories.filter((c) => c.id !== body.id));
  return NextResponse.json({ status: "deleted" });
}
