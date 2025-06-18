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
  Users,
  Activity,
  AlertTriangle,
  QrCode,
  Plus,
  TrendingUp,
  CheckCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  getLGAAgentDashboardStats,
  getLGAAgentRecentScans,
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

export function LGAAgentDashboard() {
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
          getLGAAgentDashboardStats(),
          getLGAAgentRecentScans(5),
        ]);

        setStats(dashboardStats);
        setRecentScans(scansData as RecentScan[]);

        toast.success("Dashboard loaded successfully");
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
      <Alert variant="destructive" className="mx-4 mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 space-y-6">
      {/* Mobile-first Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              LGA Agent Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage vehicles and users in your LGA
            </p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1">
            <MapPin className="mr-1 h-3 w-3" />
            LGA Agent
          </Badge>
        </div>
      </div>

      {/* Mobile-first Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Vehicles
              </CardTitle>
              <Car className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalVehicles}
            </div>
            <p className="text-xs text-muted-foreground">In your LGA</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Active Vehicles
              </CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.activeVehicles}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                My Scans
              </CardTitle>
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.recentScans}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground">Vehicles created</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile First */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-sm">
            Common tasks for vehicle management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button className="h-16 flex-col gap-2 text-sm" asChild>
              <Link href="/vehicles/add">
                <Plus className="h-5 w-5" />
                Add Vehicle
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 text-sm"
              asChild
            >
              <Link href="/vehicles">
                <Car className="h-5 w-5" />
                View Vehicles
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 text-sm"
              asChild
            >
              <Link href="/scan">
                <QrCode className="h-5 w-5" />
                Scan Vehicle
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 text-sm"
              asChild
            >
              <Link href="/users">
                <Users className="h-5 w-5" />
                View Users
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Vehicle Status Overview
          </CardTitle>
          <CardDescription className="text-sm">
            Status distribution in your LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {stats.vehiclesByStatus.active}
              </div>
              <p className="text-sm text-green-600 font-medium">Active</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">
                {stats.vehiclesByStatus.inactive}
              </div>
              <p className="text-sm text-gray-600 font-medium">Inactive</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {stats.vehiclesByStatus.owing}
              </div>
              <p className="text-sm text-orange-600 font-medium">Owing</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {stats.vehiclesByStatus.cleared}
              </div>
              <p className="text-sm text-blue-600 font-medium">Cleared</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-first Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5" />
              My Recent Scans
            </CardTitle>
            <CardDescription className="text-sm">
              Your latest vehicle scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-3">
                  No recent scans
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/scan">Start Scanning</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {scan.Vehicle.plateNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.Vehicle.category} • {scan.Vehicle.color}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          scan.declaredRouteHit ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {scan.declaredRouteHit ? "Valid" : "Off Route"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              My Recent Activities
            </CardTitle>
            <CardDescription className="text-sm">
              Your latest system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-3">
                  No recent activities
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {activity.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.Vehicle && (
                        <p className="text-xs text-muted-foreground font-medium">
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
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-4 w-32 sm:w-48 mt-2" />
          </div>
          <Skeleton className="h-6 w-24 sm:w-32" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3 sm:p-4">
            <CardHeader className="p-0 pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              <Skeleton className="h-3 w-16 sm:w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 sm:h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 sm:h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-3 rounded-lg border">
                <Skeleton className="h-6 sm:h-8 w-8 sm:w-12 mx-auto" />
                <Skeleton className="h-3 w-12 sm:w-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-32" />
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
