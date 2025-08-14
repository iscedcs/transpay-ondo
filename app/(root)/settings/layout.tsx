import { auth } from "@/auth";
import { isAuthorized } from "@/lib/auth";
import { Role } from "@prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Transpay - Settings",
  description: "List of all Settings",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!isAuthorized(session?.user.role as Role, ["SUPERADMIN"])) {
    redirect("/dashboard?error=unauthorized");
  }
  return <>{children}</>;
}
