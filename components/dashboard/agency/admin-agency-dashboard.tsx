"use client";

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

  const { data: session } = useSession();

  const role = session?.user?.role;
  const token = session?.user?.access_token;

  useEffect(() => {
    const fetchAgencies = async () => {
      if (!token) return;

      try {
        if (role === "SUPERADMIN") {
          const res = await axios.get(`${API}${URLS.agency.all}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success) setAgencies(res.data.data || []);
          else toast.error(res.data?.message || "Failed to fetch agencies");
        } else if (role === "AGENCY_ADMIN") {
          const agencyId = session?.user?.id;
          if (!agencyId) {
            toast.error("No agency assigned to your account.");
            return;
          }

          const res = await axios.get(
            `${API}${URLS.agency.one.replace("{id}", agencyId)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data?.success) setMyAgency(res.data.data);
          else toast.error(res.data?.message || "Failed to load your agency");
        }
      } catch (error: any) {
        console.error("Agency fetch error:", error);
        toast.error("Failed to load agencies", {
          description:
            error?.response?.data?.message || "An unknown error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, [session]);

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
                  {myAgency._count?.users || 0}
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
                  {/* {dashboard?.statistics?.totalTransactions || 0} */}0
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
                  {/* ₦{dashboard?.statistics?.totalVolume?.toLocaleString() || 0} */}
                  0
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
                  {/* {dashboard?.statistics?.successRate || 0}% */}0
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
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/agency/${myAgency.id}/dashboard`}>View All</Link>
              </Button>
            </CardHeader>
            {/* <CardContent>
              {dashboard?.recentTransactions?.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2">Reference</th>
                      <th className="text-left px-4 py-2">Amount</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTransactions.map((t: any) => (
                      <tr key={t.transactionReference} className="border-b">
                        <td className="px-4 py-2">{t.transactionReference}</td>
                        <td className="px-4 py-2">
                          ₦{t.amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              t.status === "SUCCESS"
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
            </CardContent> */}
          </Card>
        </>
      )}
    </div>
  );
}
