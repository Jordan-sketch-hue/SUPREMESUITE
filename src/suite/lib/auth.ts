import { cookies } from "next/headers";

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

async function importKey(usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

async function sign(payload: string): Promise<string> {
  const key = await importKey(["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verify(payload: string, sig: string): Promise<boolean> {
  const key = await importKey(["verify"]);
  const sigBytes = new Uint8Array(
    sig.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
}

export async function createToken(session: SsSession): Promise<string> {
  const payload = btoa(JSON.stringify(session))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const sig = await sign(payload);
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
    if (!(await verify(payload, sig))) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    if (!data.tenantSlug || !data.userId || !data.role) return null;
    return data as SsSession;
  } catch {
    return null;
  }
}

export async function setSession(session: SsSession) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, await createToken(session), {
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
