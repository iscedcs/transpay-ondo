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
  const userRequest = await getMe();

  if (!userRequest.user) {
    redirect("/sign-in");
  }

  if (userRequest.user.status === "BLOCKED") {
    redirect("/blocked");
  }
  if (!userRequest.user) {
    redirect("/sign-in");
  }

  if (userRequest.user.role === Role.LGA_ADMIN) {
    return <LGAAdminDashboard />;
  }

  if (userRequest.user.role === Role.LGA_C_AGENT) {
    return <LGACAgentDashboard />;
  }

  if (userRequest.user.role === Role.LGA_AGENT) {
    return <LGAAgentDashboard />;
  }

  return <SuperadminDashboard />;
}
