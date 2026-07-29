import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth-server";
import { getAdmin } from "./store";
import { redis } from "./redis";

export async function requireAdmin(
  req: NextRequest
): Promise<{ username: string } | NextResponse> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    const admin = await getAdmin();
    if (!admin || admin.username !== payload.username) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }
    return { username: payload.username };
  } catch {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 401 });
  }
}

export function isErrorResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}

// Fixed-window rate limiter backed by Redis (works across serverless
// instances, unlike an in-memory map). Used to slow down login brute-forcing.
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= limit;
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}
