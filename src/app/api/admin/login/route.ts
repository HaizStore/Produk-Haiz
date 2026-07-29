import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/store";
import { verifyPassword, signToken } from "@/lib/auth-server";
import { checkRateLimit, clientIp } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const allowed = await checkRateLimit(`ratelimit:login:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "too many login attempts, try again later" },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const admin = await getAdmin();
  if (
    !admin ||
    !body.username ||
    !body.password ||
    body.username !== admin.username ||
    !verifyPassword(body.password, admin.salt, admin.passwordHash)
  ) {
    return NextResponse.json(
      { error: "invalid username or password" },
      { status: 401 }
    );
  }

  const token = signToken(admin.username);
  return NextResponse.json({ token });
}
