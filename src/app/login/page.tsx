"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/lib/actions/auth";
import { SubmitButton, FormErrors } from "@/components/form";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action] = useActionState<ActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-emerald-700 to-emerald-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
            RT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Masuk Aplikasi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aplikasi manajemen RT/RW
          </p>
        </div>

        <form action={action} className="space-y-4">
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <FormErrors state={state} />
          <SubmitButton pendingText="Masuk...">Masuk</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
