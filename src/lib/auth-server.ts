import crypto from "node:crypto";

// ---------- Password hashing (Node's built-in scrypt — no extra deps) ----------

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(
  password: string,
  salt: string,
  wantHashHex: string
): boolean {
  const got = hashPassword(password, salt);
  const a = Buffer.from(got, "hex");
  const b = Buffer.from(wantHashHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function randomHex(bytes: number): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// ---------- Signed session tokens (HMAC, JWT-equivalent, no library needed) ----------

interface TokenPayload {
  username: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 24) {
    // During build (vercel build), this might not be set yet.
    // Return a dummy secret to avoid build crash, but log warning.
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_JWT_SECRET) {
      console.warn('[WARN] ADMIN_JWT_SECRET not set — admin login will fail. Set it in Vercel Environment Variables.');
      return 'build-time-dummy-secret-do-not-use-in-production';
    }
    throw new Error(
      "ADMIN_JWT_SECRET env var must be set (min 24 chars) — generate with `openssl rand -hex 32`"
    );
  }
  return secret;
}

export function signToken(username: string, ttlSeconds = 12 * 60 * 60): string {
  const payload: TokenPayload = {
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): TokenPayload {
  const dot = token.lastIndexOf(".");
  if (dot === -1) throw new Error("malformed token");
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("invalid signature");
  }

  const payload: TokenPayload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8")
  );
  if (Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("token expired");
  }
  return payload;
}
