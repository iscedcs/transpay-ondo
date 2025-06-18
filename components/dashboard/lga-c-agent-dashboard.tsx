"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Car,
  Shield,
  Activity,
  AlertTriangle,
  QrCode,
  Search,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentScans,
  type DashboardStats,
} from "@/actions/dashboard";
import { toast } from "sonner";
import Link from "next/link";

interface RecentScan {
  id: string;
  createdAt: Date;
  Vehicle: {
    plateNumber: string;
    color: string | null;
    category: string | null;
  };
  LGA: {
    name: string;
  } | null;
  latitude: number;
  longitude: number;
  declaredRouteHit: boolean;
  extraCharge: number;
}

export function LGACAgentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardStats, scansData] = await Promise.all([
          getDashboardStats(),
          getRecentScans(5),
        ]);

        setStats(dashboardStats);
        setRecentScans(scansData as RecentScan[]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMessage);
        toast.error("Failed to load dashboard", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-5">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor vehicle compliance in your LGA
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Shield className="mr-1 h-3 w-3" />
          Compliance Agent
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">In your LGA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vehicles
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
            <QrCode className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentScans}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vehicle Status Overview
          </CardTitle>
          <CardDescription>
            Current status distribution of vehicles in your LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.vehiclesByStatus.active}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.vehiclesByStatus.inactive}
              </div>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.vehiclesByStatus.owing}
              </div>
              <p className="text-sm text-muted-foreground">Owing</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.vehiclesByStatus.cleared}
              </div>
              <p className="text-sm text-muted-foreground">Cleared</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Recent Scans
            </CardTitle>
            <CardDescription>Your latest vehicle scans</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-4">
                <QrCode className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  No recent scans
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Car className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {scan.Vehicle.plateNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {scan.Vehicle.category} • {scan.Vehicle.color}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          scan.declaredRouteHit ? "default" : "destructive"
                        }
                      >
                        {scan.declaredRouteHit ? "Valid Route" : "Off Route"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/scan">
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Scanning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivities.length === 0 ? (
              <div className="text-center py-4">
                <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  No recent activities
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      {activity.Vehicle && (
                        <p className="text-xs text-muted-foreground">
                          Vehicle: {activity.Vehicle.plateNumber}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/activities">
                  <Activity className="mr-2 h-4 w-4" />
                  View All Activities
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for compliance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2" asChild>
              <Link href="/scan">
                <QrCode className="h-6 w-6" />
                Scan Vehicle
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/search">
                <Search className="h-6 w-6" />
                Search Vehicles
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/vehicles">
                <Car className="h-6 w-6" />
                View All Vehicles
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
