import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MobileNav, SideNav } from "@/components/app-shell";
import { SecurityAlert } from "@/components/security-alert";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-dvh">
      <SideNav userName={session.name} userRole={session.role} />
      <main className="pb-20 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      </main>
      <MobileNav />
      <SecurityAlert />
    </div>
  );
}
