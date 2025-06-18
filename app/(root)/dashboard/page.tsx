import { getMe } from "@/actions/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { LGACAgentDashboard } from "@/components/dashboard/lga-c-agent-dashboard";
import SuperadminDashboard from "./superadmin-dashboard.tsx";
import { LGAAgentDashboard } from "@/components/dashboard/lga-agent-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/sign-in");
  }
  const user = await getMe();
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === Role.LGA_C_AGENT) {
    return <LGACAgentDashboard />;
  }

  if (user.role === Role.LGA_AGENT) {
    return <LGAAgentDashboard />;
  }

  return <SuperadminDashboard />;
}
