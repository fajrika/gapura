import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-slate-900", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

const badgeVariants: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  danger: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  info: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  neutral: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: "success" | "danger" | "warning" | "info" | "neutral";
  children: React.ReactNode;
}) {
  const v = badgeVariants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        v.bg,
        v.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", v.dot)} />
      {children}
    </span>
  );
}
