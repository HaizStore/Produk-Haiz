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

    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json({ error: "No image path provided" }, { status: 400 });
    }

    // SECURITY: don't trust the raw path — a string like
    // "/images/../../../etc/passwd" still passes a naive startsWith("/images/")
    // check and can escape the intended directory once path.join() resolves it.
    // Instead, take only the basename and require it to match the exact
    // filename format this app itself generates (random hex + known extension).
    const filename = path.basename(imagePath);
    const SAFE_FILENAME = /^[a-f0-9]{32}\.(png|jpe?g|gif|webp)$/i;
    if (!SAFE_FILENAME.test(filename)) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

    const imagesDir = path.join(process.cwd(), "public", "images");
    const fullPath = path.join(imagesDir, filename);

    // Defense in depth: confirm the resolved path is still inside imagesDir
    if (!fullPath.startsWith(imagesDir + path.sep)) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

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
