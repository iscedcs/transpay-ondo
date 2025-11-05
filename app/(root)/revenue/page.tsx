import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import RevenueContent from "@/components/revenue/revenue-content";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Require authentication with proper roles
  const user = await requireAuth({
    allowedRoles: ["SUPERADMIN", "ADMIN", "ODIRS_ADMIN", "AGENCY_ADMIN"],
  });

  const params = await searchParams;

  return (
    <div className="mx-auto p-5 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          {user.role === "LGA_ADMIN"
            ? "Monitor your LGA's revenue performance"
            : "Monitor state-wide and LGA-specific revenue performance"}
        </p>
      </div>

      <Suspense fallback={<RevenuePageSkeleton />}>
        <RevenueContent user={user} searchParams={params} />
      </Suspense>
    </div>
  );
}

function RevenuePageSkeleton() {
  return (
    <div className="space-y-6 p-5">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
