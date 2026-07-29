import { NextRequest, NextResponse } from "next/server";
import { setConfig } from "@/lib/store";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
import { StoreConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: StoreConfig;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!body.storeName || !body.storeName.trim()) {
    return NextResponse.json({ error: "storeName is required" }, { status: 400 });
  }

  await setConfig(body);
  return NextResponse.json(body);
}
