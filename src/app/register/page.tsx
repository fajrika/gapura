"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/lib/actions/auth";
import { SubmitButton, FormErrors } from "@/components/form";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const [state, action] = useActionState<ActionState, FormData>(
    registerAction,
    {},
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-emerald-700 to-emerald-900 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Daftar Akun</h1>
          <p className="mt-1 text-sm text-slate-500">
            Buat akun untuk warga RT
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Nama kamu" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">No. HP (opsional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <Label htmlFor="nik">
              NIK (opsional — supaya terhubung ke data warga)
            </Label>
            <Input id="nik" name="nik" placeholder="16 digit NIK" inputMode="numeric" />
          </div>
          <FormErrors state={state} />
          <SubmitButton pendingText="Mendaftar...">Daftar</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
