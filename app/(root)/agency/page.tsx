"use client";

import AgencyDashboardFilters from "@/components/shared/agency/agency-dashboard-filters";
import AgencyListSkeleton from "@/components/shared/skeleton/agency-dashboard-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API, URLS } from "@/lib/const";
import axios from "axios";
import {
  Activity,
  Building2,
  MoreHorizontal,
  PlusCircle,
  TrendingUp,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AgencyListPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myAgency, setMyAgency] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  const { data: session } = useSession();

  const role = session?.user?.role;
  const token = session?.user?.access_token;

  useEffect(() => {
    const fetchAgencies = async () => {
      if (!token) return;

      try {
        if (role === "SUPERADMIN") {
          // ✅ Fetch all agencies for superadmin
          const res = await axios.get(`${API}${URLS.agency.all}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.success) setAgencies(res.data.data || []);
          else toast.error(res.data?.message || "Failed to fetch agencies");
        }

        // ✅ Handle AGENCY_ADMIN flow
        else if (role === "AGENCY_ADMIN") {
          const adminId = session?.user?.id;
          if (!adminId) {
            toast.error("No admin ID found in session");
            return;
          }

          // Step 1: Fetch agency tied to this admin
          const agencyRes = await axios.get(
            `${API}${URLS.agency.one_agency_admin.replace("{id}", adminId)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const agency = agencyRes.data?.data?.agency;
          if (!agency) {
            toast.error("No agency found for this admin");
            return;
          }

          setMyAgency(agency);

          // Step 2: Fetch agency dashboard data
          const dashboardRes = await axios.get(
            `${API}${URLS.agency.agency_dashboard.replace("{id}", agency.id)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (dashboardRes.data?.success) {
            setDashboard({
              ...dashboardRes.data.data.statistics,
              recentTransactions:
                dashboardRes.data.data.recentTransactions || [],
            });
          } else {
            toast.error(
              dashboardRes.data?.message || "Failed to load dashboard"
            );
          }
        }
      } catch (error: any) {
        console.error("Agency fetch error:", error);
        toast.error("Failed to load agency dashboard", {
          description:
            error?.response?.data?.message || "An unknown error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, [session, token, role]);

  const fetchDashboardData = async (startDate?: string | null) => {
    if (!myAgency?.id || !token) return;

    const res = await axios.get(
      `${API}${URLS.agency.agency_dashboard.replace("{id}", myAgency.id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data?.success) {
      let transactions = res.data.data.recentTransactions || [];

      if (startDate) {
        const start = new Date(startDate);
        transactions = transactions.filter(
          (t: any) => new Date(t.createdAt) >= start
        );
      }

      setDashboard({
        ...res.data.data.statistics,
        recentTransactions: transactions,
      });
    }
  };

  if (isLoading)
    return (
      <div>
        <AgencyListSkeleton />
      </div>
    );

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {role === "AGENCY_ADMIN"
              ? `Welcome back, ${session?.user.name}!`
              : "Agency Management"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {role === "AGENCY_ADMIN"
              ? "View and manage your assigned agency"
              : "Manage all agencies and their assigned agents"}
          </p>
        </div>

        {/* Add Actions (hidden for agency_admin) */}
        {role === "SUPERADMIN" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/agency/add">Create Agency</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agency/add/agent">Add Agent to Agency</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {role === "AGENCY_ADMIN" && (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <Link href="/agency/add/agent">Add Agent to Agency</Link>
          </Button>
        )}
      </div>

      {role === "SUPERADMIN" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agencies
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agencies.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agencies.reduce(
                    (total, a) => total + (a._count?.users || 0),
                    0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Agencies
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agencies.filter((a) => a.status === "ACTIVE").length}
                </div>
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
                <div className="text-2xl font-bold">₦0</div>
              </CardContent>
            </Card>
          </div>

          {/* Agency Table */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Agencies</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => location.reload()}>
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Agency Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.length > 0 ? (
                    agencies.map((agency) => (
                      <tr key={agency.id} className="border-b">
                        <td className="px-4 py-3">{agency.name}</td>
                        <td className="px-4 py-3">{agency.contactEmail}</td>
                        <td className="px-4 py-3">{agency.contactPhone}</td>
                        <td className="px-4 py-3">
                          {new Date(agency.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/agency/${agency.id}`}>View</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/agency/add/agent?agencyId=${agency.id}`}>
                                  Add Agent
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground">
                        No agencies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* AGENCY_ADMIN → Only My Agency Card */}
      {role === "AGENCY_ADMIN" && myAgency && (
        <>
          <AgencyDashboardFilters
            onChange={(range) => {
              // Map selected range to API query parameters
              const now = new Date();
              let startDate: string | null = null;

              switch (range) {
                case "today":
                  startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                  break;
                case "week":
                  startDate = new Date(
                    now.setDate(now.getDate() - 7)
                  ).toISOString();
                  break;
                case "month":
                  startDate = new Date(
                    now.setMonth(now.getMonth() - 1)
                  ).toISOString();
                  break;
                case "quarter":
                  startDate = new Date(
                    now.setMonth(now.getMonth() - 3)
                  ).toISOString();
                  break;
                default:
                  startDate = null;
                  break;
              }

              fetchDashboardData(startDate);
            }}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {dashboard?.totalAgents || myAgency?._count?.users || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Under your agency
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  <p className="text-2xl font-bold">
                    {dashboard?.totalTransactions || 0}
                  </p>
                </p>
                <p className="text-xs text-muted-foreground">All-time total</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Volume
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₦{(dashboard?.totalVolume || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Agency revenue</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {dashboard?.successRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground">of transactions</p>
              </CardContent>
            </Card>
          </div>

          <Card
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => location.assign(`/agency/${myAgency.id}`)}>
            <CardHeader>
              <CardTitle>{myAgency.name}</CardTitle>
              <CardDescription>{myAgency.contactEmail}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status: {myAgency.status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/agency/${myAgency.id}/dashboard`}>View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboard?.recentTransactions?.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2">Plate Number</th>
                      <th className="text-left px-4 py-2">Agent</th>
                      <th className="text-left px-4 py-2">Amount</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTransactions.slice(0, 5).map((t: any) => (
                      <tr key={t.id} className="border-b hover:bg-muted/40">
                        <td className="px-4 py-2 font-medium">
                          {t.vehicle?.plateNumber || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {t.agent?.firstName} {t.agent?.lastName}
                        </td>
                        <td className="px-4 py-2">
                          ₦{Number(t.vehicleOwnerAmount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              t.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : t.status === "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent transactions yet.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
