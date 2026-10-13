import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "ss_auth";

export type SsSession = {
  tenantSlug: string;
  userId: string;
  role: "owner" | "admin" | "member";
};

function secret(): string {
  const s = process.env.SS_JWT_SECRET;
  if (!s) throw new Error("SS_JWT_SECRET is not configured");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createToken(session: SsSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export async function getSession(): Promise<SsSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = sign(payload);
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data.tenantSlug || !data.userId || !data.role) return null;
    return data as SsSession;
  } catch {
    return null;
  }
}

export async function setSession(session: SsSession) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
