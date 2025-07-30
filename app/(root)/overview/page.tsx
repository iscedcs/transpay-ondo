import { getMe } from "@/actions/users";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AgentPerformanceTable } from "@/components/overview/agent-performance-table";
import { ComplianceSummaryChart } from "@/components/overview/compliance-summary-chart";
import { KPIStatsCards } from "@/components/overview/kpi-stats-cards";
import { OverviewHeader } from "@/components/overview/overview-header";
import { RecentActivityTimeline } from "@/components/overview/recent-activity-timeline";
import { RegistrationsByDay } from "@/components/overview/registrations-by-day";
import { TopDefaultersList } from "@/components/overview/top-defaulters-list";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { checkUserAccess } from "@/lib/auth";
import {
  getAgentPerformance,
  getComplianceData,
  getOverviewStats,
  getRecentActivity,
  getRegistrationData,
  getTopDefaulters,
} from "@/lib/overview-data";
import { Role } from "@prisma/client";
import { Suspense } from "react";

// Loading components
function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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

async function OverviewContent() {
  const user: any = (await getMe()).user;

  // Check access permissions
  const allowedRoles = [
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.EIRS_ADMIN,
    Role.LGA_ADMIN,
    Role.LGA_AGENT,
    Role.EIRS_AGENT,
    Role.LGA_C_AGENT,
  ];
  checkUserAccess(user, allowedRoles);

  // Fetch all data in parallel
  const [
    stats,
    complianceData,
    registrationData,
    agentPerformance,
    topDefaulters,
    recentActivity,
  ] = await Promise.all([
    getOverviewStats(user),
    getComplianceData(user),
    getRegistrationData(user),
    getAgentPerformance(user),
    getTopDefaulters(user),
    getRecentActivity(user),
  ]);

  return (
    <div className="space-y-6">
      <OverviewHeader user={user} />

      <KPIStatsCards stats={stats} user={user} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ComplianceSummaryChart data={complianceData} />
        <RegistrationsByDay data={registrationData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AgentPerformanceTable agents={agentPerformance} />
        </div>
        <div className="space-y-6">
          <TopDefaultersList defaulters={topDefaulters} />
          <RecentActivityTimeline activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const user: any = (await getMe()).user;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        user={user}
        title="Platform Overview"
        breadcrumbs={["Dashboard", "Overview"]}
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
            <StatsLoading />
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartLoading />
              <ChartLoading />
            </div>
          </div>
        }
      >
        <OverviewContent />
      </Suspense>
    </div>
  );
}
