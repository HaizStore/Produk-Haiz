import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const imagePath = body.imagePath;

    if (!imagePath) {
      return NextResponse.json({ error: "No image path provided" }, { status: 400 });
    }

    // Only allow deleting from /images directory
    if (!imagePath.startsWith("/images/")) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

    // Remove leading slash and build file path
    const relativePath = imagePath.slice(1);
    const fullPath = path.join(process.cwd(), relativePath);

    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
    } catch {
      // File doesn't exist, that's fine
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
