import { getMe } from "@/actions/users";
import { auth } from "@/auth";
import { LGAAdminDashboard } from "@/components/dashboard/lga-admin-dashboard";
import { LGAAgentDashboard } from "@/components/dashboard/lga-agent-dashboard";
import { LGACAgentDashboard } from "@/components/dashboard/lga-c-agent-dashboard";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import SuperadminDashboard from "./superadmin-dashboard.tsx";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/sign-in");
  }
  const user = await getMe();

  if (user.status === "BLOCKED") {
    redirect("/blocked");
  }
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === Role.LGA_ADMIN) {
    return <LGAAdminDashboard />;
  }

  if (user.role === Role.LGA_C_AGENT) {
    return <LGACAgentDashboard />;
  }

  if (user.role === Role.LGA_AGENT) {
    return <LGAAgentDashboard />;
  }

  return <SuperadminDashboard />;
}
