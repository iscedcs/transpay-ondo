import { auth } from "@/auth";
import { isAuthorized } from "@/lib/auth";
import { Role } from "@prisma/client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Transpay - LGAs",
  description: "List of all available LAGs",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/sign-in");
  }
  // Check authorization
  const authorized = isAuthorized(session.user.role as Role, [
    "SUPERADMIN",
    "ADMIN",
    "EIRS_ADMIN",
  ]);

  if (!authorized) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
