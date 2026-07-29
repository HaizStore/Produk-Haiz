import { Redis } from "@upstash/redis";

// These env vars are auto-injected when you add the Upstash integration
// from the Vercel dashboard (Storage → Create Database → Upstash Redis).
// For local dev, copy them from the Upstash console into .env.local.
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
});
