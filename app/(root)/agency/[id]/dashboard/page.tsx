"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Users2,
} from "lucide-react";

import { NairaIcon } from "@/components/shared/nairaicon";
import { API, URLS } from "@/lib/const";

export default function AgencyDashboardPage() {
  const { id } = useParams();
  const router = useRouter();

  const agencyId = Array.isArray(id) ? id[0] : id ?? "";
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `${API}${URLS.agency.agency_dashboard.replace("{id}", agencyId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.success) {
        setDashboard(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to load dashboard data");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error fetching dashboard", {
        description:
          error?.response?.data?.message || "Unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agencyId && token) fetchDashboard();
  }, [agencyId, token]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading transaction...
      </div>
    );

  if (!dashboard)
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load agency transaction.
      </div>
    );

  const { agency, statistics, recentTransactions } = dashboard;

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {agency?.name} Revenue
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of performance, agents, and transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="default" size="sm" onClick={fetchDashboard}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              Active: {statistics.activeAgents}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful: {statistics.successfulTransactions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{statistics.totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Commission: ₦{statistics.totalCommission.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest transactions made through this agency
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No recent transactions found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Transaction ID</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b">
                      <td className="px-4 py-2 font-medium">{tx.id}</td>
                      <td className="px-4 py-2">
                        ₦{tx.vehicleOwnerAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
