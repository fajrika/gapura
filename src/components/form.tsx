"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";

export function SubmitButton({
  children,
  pendingText = "Menyimpan...",
}: {
  children: React.ReactNode;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}

export function FormErrors({ state }: { state: ActionState | undefined }) {
  if (!state) return null;
  return (
    <>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.fieldErrors &&
        Object.entries(state.fieldErrors).map(([key, messages]) => (
          <p key={key} className="text-sm text-red-600">
            {messages?.join(", ")}
          </p>
        ))}
    </>
  );
}

export { useFormStatus };
