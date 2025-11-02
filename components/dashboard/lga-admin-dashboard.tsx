"use client";

import {
  getLGAAdminActivities,
  getLGAAdminAgentPerformance,
  getLGAAdminDashboardStats,
} from "@/actions/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Car,
  CheckCircle,
  Clock,
  Currency,
  Eye,
  Plus,
  Scan,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  recentScans: number;
  pendingTasks: number;
  recentActivities: any[];
  vehiclesByStatus: {
    active: number;
    inactive: number;
    owing: number;
    cleared: number;
  };
  totalAgents: number;
  activeAgents: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface AgentPerformance {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  lastLogin: Date | null;
  performance: {
    scansCount: number;
    vehiclesCreated: number;
    activitiesCount: number;
  };
}

export function LGAAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>(
    []
  );
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, performanceData, activitiesData] = await Promise.all([
          getLGAAdminDashboardStats(),
          getLGAAdminAgentPerformance(),
          getLGAAdminActivities(10),
        ]);

        setStats(statsData);
        setAgentPerformance(performanceData);
        setActivities(activitiesData);

        toast.success("Dashboard loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "LGA_AGENT":
        return "default";
      case "LGA_C_AGENT":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "ACTIVE" ? "default" : "destructive";
  };

  if (loading) {
    return (
      <div className="mx-auto p-5 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto p-5">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mx-auto p-5 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ODIRS Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your local government area operations and monitor agent
          performance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Button
          onClick={() => router.push("/vehicles/add")}
          className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
        <Button
          onClick={() => router.push("/users/add")}
          variant="outline"
          className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Agent
        </Button>
        <Button
          onClick={() => router.push("/vehicles")}
          variant="outline"
          className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Vehicles
        </Button>
        <Button
          onClick={() => router.push("/scan")}
          variant="outline"
          className="flex items-center gap-2">
          <Scan className="h-4 w-4" />
          Scan Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentScans}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Currency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehicles This Month
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalVehicles > 0
                ? Math.round((stats.activeVehicles / stats.totalVehicles) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Active vehicles</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Status Overview
          </CardTitle>
          <CardDescription>
            Distribution of vehicle statuses in your LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <span className="text-sm text-muted-foreground">
                  {stats.vehiclesByStatus.active}
                </span>
              </div>
              <Progress
                value={
                  stats.totalVehicles > 0
                    ? (stats.vehiclesByStatus.active / stats.totalVehicles) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inactive</span>
                <span className="text-sm text-muted-foreground">
                  {stats.vehiclesByStatus.inactive}
                </span>
              </div>
              <Progress
                value={
                  stats.totalVehicles > 0
                    ? (stats.vehiclesByStatus.inactive / stats.totalVehicles) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Owing</span>
                <span className="text-sm text-muted-foreground">
                  {stats.vehiclesByStatus.owing}
                </span>
              </div>
              <Progress
                value={
                  stats.totalVehicles > 0
                    ? (stats.vehiclesByStatus.owing / stats.totalVehicles) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cleared</span>
                <span className="text-sm text-muted-foreground">
                  {stats.vehiclesByStatus.cleared}
                </span>
              </div>
              <Progress
                value={
                  stats.totalVehicles > 0
                    ? (stats.vehiclesByStatus.cleared / stats.totalVehicles) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Performance
              </CardTitle>
              <CardDescription>
                Performance metrics for agents in your LGA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No agents found in your LGA</p>
                  </div>
                ) : (
                  agentPerformance.map((agent) => (
                    <Link
                      href={`/user/${agent.id}`}
                      key={agent.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {agent.firstName[0]}
                            {agent.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {agent.firstName} {agent.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {agent.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getRoleBadgeColor(agent.role)}>
                              {agent.role.replace("_", " ")}
                            </Badge>
                            <Badge variant={getStatusBadgeColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">
                            {agent.performance.scansCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Scans
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {agent.performance.vehiclesCreated}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vehicles
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {agent.performance.activitiesCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Activities
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                All activities related to your LGA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No recent activities</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {/* {activity.user.firstName[0]}
                            {activity.user.lastName[0]} */}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <p className="text-sm font-medium">
                              {/* {activity.user.firstName} {activity.user.lastName} */}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {/* {activity.user.role.replace("_", " ")} */}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              <Clock className="inline h-3 w-3 mr-1" />
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        {activity.Vehicle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Vehicle: {activity.Vehicle.plateNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
