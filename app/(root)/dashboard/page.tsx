import { getMe } from "@/actions/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SuperadminDashboard from "./superadmin-dashboard.tsx";
import { Role } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/sign-in");
  }
  const user = await getMe();
  if (!user || user.role !== Role.SUPERADMIN) {
    redirect("/sign-in");
  }

  return <SuperadminDashboard />;
}
