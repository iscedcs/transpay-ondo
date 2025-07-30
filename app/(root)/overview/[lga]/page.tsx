import { getMe } from "@/actions/users";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AgentActivityCard } from "@/components/overview/agent-activity-card";
import { LGAActivityTrend } from "@/components/overview/lga-activity-trend";
import { LGAHeader } from "@/components/overview/lga-header";
import { LGAStatsCards } from "@/components/overview/lga-stats-cards";
import { LGAVehicleStatusChart } from "@/components/overview/lga-vehicle-status-chart";
import { RecentVehicleTable } from "@/components/overview/recent-vehicle-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { checkUserAccess } from "@/lib/auth";
import { getLGAOverviewData } from "@/lib/overview-data";
import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Loading components
function LGAStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

async function LGAOverviewContent({ lgaId }: { lgaId: string }) {
  const user: any = (await getMe()).user;

  // Check access permissions
  const allowedRoles = [Role.SUPERADMIN, Role.ADMIN, Role.LGA_ADMIN];
  checkUserAccess(user, allowedRoles);

  try {
    const lgaData = await getLGAOverviewData(lgaId, user);

    return (
      <div className="space-y-6">
        <LGAHeader user={user} lgaData={lgaData} />

        <LGAStatsCards stats={lgaData.stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <LGAVehicleStatusChart data={lgaData.vehicleStatus} />
          <LGAActivityTrend data={lgaData.activityTrend} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentVehicleTable vehicles={lgaData.recentVehicles} />
          <AgentActivityCard agents={lgaData.agents} />
        </div>
      </div>
    );
  } catch (error) {
    console.log("Error loading LGA data:", error);
    notFound();
  }
}

export default async function LGAOverviewPage({
  params,
}: {
  params: Promise<{
    lga: string;
  }>;
}) {
  const user: any = (await getMe()).user;
  const lgaId = (await params).lga;

  // Convert kebab-case to title case for display
  const lgaDisplayName = lgaId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        user={user}
        title={`${lgaDisplayName} Overview`}
        breadcrumbs={["Dashboard", "Overview", lgaDisplayName]}
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
            <LGAStatsLoading />
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartLoading />
              <ChartLoading />
            </div>
          </div>
        }
      >
        <LGAOverviewContent lgaId={lgaId} />
      </Suspense>
    </div>
  );
}
