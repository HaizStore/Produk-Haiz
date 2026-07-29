import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}
