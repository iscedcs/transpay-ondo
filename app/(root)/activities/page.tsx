import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import { getActivityStats } from "@/actions/activities";
import { ActivitiesContent } from "@/components/activities-content";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  // if (!canViewAdmin(session.user.role)) {
  //   redirect("/unauthorized");
  // }

  // if (!ADMIN_ROLES.includes(String(session?.user.role))) {
  //   redirect{'/unauthorized'}
  // }
  const resolvedSearchParams = await searchParams;
  const stats = await getActivityStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Monitor all system activities and audit trails
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="mr-1 h-3 w-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalActivities.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayActivities}</div>
            <p className="text-xs text-muted-foreground">Activities today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekActivities}</div>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthActivities}</div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Activity Types */}
      <Card>
        <CardHeader>
          <CardTitle>Top Activity Types</CardTitle>
          <CardDescription>
            Most frequent activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topActivityTypes.map((type, index) => (
              <div
                key={type.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">
                      {type.name.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{type.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities Content */}
      <Suspense fallback={<ActivitiesLoading />}>
        <ActivitiesContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}

function ActivitiesLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
