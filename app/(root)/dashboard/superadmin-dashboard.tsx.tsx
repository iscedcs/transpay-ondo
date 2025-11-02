import { Suspense } from "react";
import {
  TransactionsSummarySkeleton,
  OutstandingFeesSkeleton,
  ComplianceRateSkeleton,
  MonthlyRevenueSkeleton,
  UserRolesSkeleton,
  VehicleTypesSkeleton,
  ComplianceOverviewSkeleton,
  LGARevenueSkeleton,
  VehicleDistributionSkeleton,
} from "@/app/(root)/dashboard/dashboard-skeletons";
import { TransactionsSummary } from "./dashboard-transaction-summary";
import { OutstandingFees } from "./dashboard-outstanding-fees";
import { ComplianceRate } from "./dashboard-compliance-rate";
import { MonthlyRevenueChange } from "./dashboard-monthly-revenue-change";
import { UserRoles } from "./dashboard-users-by-role";
import { VehicleTypes } from "./dashboard-vehicle-types";
import { ComplianceOverview } from "./dashboard-compliance-overview";
import { LGARevenue } from "./dashboard-lga-revenue";
import { VehicleDistribution } from "./dashboard-vehocle-distribution";

export default function SuperadminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="mx-auto container grid gap-6 pb-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of vehicle transactions, compliance, and revenue metrics
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<TransactionsSummarySkeleton />}>
            <TransactionsSummary />
          </Suspense>

          <Suspense fallback={<OutstandingFeesSkeleton />}>
            <OutstandingFees />
          </Suspense>

          <Suspense fallback={<ComplianceRateSkeleton />}>
            <ComplianceRate />
          </Suspense>

          <Suspense fallback={<MonthlyRevenueSkeleton />}>
            <MonthlyRevenueChange />
          </Suspense>
        </div>

        {/* Charts and Data Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<UserRolesSkeleton />}>
            <UserRoles />
          </Suspense>

          <Suspense fallback={<VehicleTypesSkeleton />}>
            <VehicleTypes />
          </Suspense>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<LGARevenueSkeleton />}>
            <LGARevenue />
          </Suspense>

          <Suspense fallback={<VehicleDistributionSkeleton />}>
            <VehicleDistribution />
          </Suspense>
        </div>

        {/* Compliance Details */}
        <Suspense fallback={<ComplianceOverviewSkeleton />}>
          <ComplianceOverview />
        </Suspense>
      </div>
    </div>
  );
}
