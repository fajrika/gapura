"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users, wargas } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional().or(z.literal("")),
  nik: z.string().optional().or(z.literal("")),
});

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email atau password salah" };
  }

  const token = await createSessionToken({
    sub: String(user.id),
    role: user.role,
    name: user.name,
  });
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    nik: formData.get("nik"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  let wargaId: number | null = null;
  if (parsed.data.nik) {
    const warga = await db.query.wargas.findFirst({
      where: eq(wargas.nik, parsed.data.nik),
    });
    if (warga) wargaId = warga.id;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.phone || null,
      role: "warga",
      wargaId,
    })
    .returning();

  const token = await createSessionToken({
    sub: String(user.id),
    role: "warga",
    name: user.name,
  });
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
