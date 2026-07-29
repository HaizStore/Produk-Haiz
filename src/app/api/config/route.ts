import { NextResponse } from "next/server";
import { getConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}
