import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";
import fs from "fs/promises";
import path from "path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

// Allowed image extensions
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: png, jpg, jpeg, gif, webp" },
        { status: 400 }
      );
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images");
    const filePath = path.join(uploadDir, uniqueName);

    // Save file
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      path: `/images/${uniqueName}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
