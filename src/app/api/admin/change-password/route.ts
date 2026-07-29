import { NextRequest, NextResponse } from "next/server";
import { getAdmin, setAdmin } from "@/lib/store";
import { verifyPassword, hashPassword, randomHex } from "@/lib/auth-server";
import { requireAdmin, isErrorResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (isErrorResponse(authResult)) return authResult;

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const admin = await getAdmin();
  if (!admin || !body.currentPassword || !verifyPassword(body.currentPassword, admin.salt, admin.passwordHash)) {
    return NextResponse.json({ error: "current password is incorrect" }, { status: 401 });
  }
  if (!body.newPassword || body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "new password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const salt = randomHex(16);
  await setAdmin({
    username: admin.username,
    salt,
    passwordHash: hashPassword(body.newPassword, salt),
  });

  return NextResponse.json({ status: "password updated" });
}
