import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, saveAllProducts } from "@/lib/store";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// Body: { ids: string[] } — ordered list of product ids
export async function PUT(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: { ids?: string[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids must be array" }, { status: 400 });
  }

  const all = await getAllProducts();
  const reordered = body.ids
    .map((id, idx) => {
      const p = all.find((x) => x.id === id);
      if (!p) return null;
      return { ...p, order: idx };
    })
    .filter(Boolean) as typeof all;

  // Keep products not in ids list at the end
  const missing = all.filter((p) => !body.ids!.includes(p.id));
  const final = [...reordered, ...missing.map((p, i) => ({ ...p, order: reordered.length + i }))];

  await saveAllProducts(final);
  return NextResponse.json({ status: "ok" });
}
