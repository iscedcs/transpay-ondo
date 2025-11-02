import { getMe } from "@/actions/users";
import { auth } from "@/auth";
import { LGAAdminDashboard } from "@/components/dashboard/lga-admin-dashboard";
import { LGAAgentDashboard } from "@/components/dashboard/lga-agent-dashboard";
import { LGACAgentDashboard } from "@/components/dashboard/lga-c-agent-dashboard";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import SuperadminDashboard from "./superadmin-dashboard.tsx";
// import AgencyAdminDashboard from "@/components/dashboard/agency/admin-agency-dashboard.jsx";

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

  // BEGIN: ed8c6549bwf9
  const renderDashboard = () => {
    switch (userRequest.user.role) {
      case Role.ODIRS_ADMIN:
        return <LGAAdminDashboard />;
      case Role.ODIRS_C_AGENT:
        return <LGACAgentDashboard />;
      case Role.AGENCY_AGENT:
        return <LGAAgentDashboard />;
      // case Role.AGENCY_ADMIN:
      //   return <AgencyAdminDashboard />;
      // case Role.AGENCY_AGENT:
      //   return <AgencyAgentDashboard />;
      default:
        return <SuperadminDashboard />;
    }
  };

  return (
    <div>
      {userRequest.user.lga && (
        <div className="mx-auto  grid gap-6 px-4 ">
          <div className="flex justify-between gap-5 font-bold uppercase">
            <div className="">{userRequest.user.lga.name}</div>
          </div>
        </div>
      )}
      {renderDashboard()}
    </div>
  );
}
