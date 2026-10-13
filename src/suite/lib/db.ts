import { neon } from "@neondatabase/serverless";

// Lazy — throws only when called, not at module evaluation (safe for builds without DATABASE_URL)
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}
