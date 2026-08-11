import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "gapura_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  sub: string;
  role: "admin" | "pengurus" | "warga" | "security";
  name: string;
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      role: payload.role as SessionPayload["role"],
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

export const requireAuth = cache(
  async (): Promise<{ user: SessionPayload; dbUser: typeof users.$inferSelect }> => {
    const session = await getSession();
    if (!session) throw new Error("unauthorized");
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, Number(session.sub)),
    });
    if (!dbUser) throw new Error("unauthorized");
    return { user: session, dbUser };
  },
);

export function isAdminRole(role: string) {
  return role === "admin";
}

export function isPengurusRole(role: string) {
  return role === "admin" || role === "pengurus";
}
