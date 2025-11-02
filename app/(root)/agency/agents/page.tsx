"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, Search, FileText, BadgePercent } from "lucide-react";
import { agentAPI } from "@/lib/utils";

export default function AgencyAgentsDashboardPage() {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;
      try {
        const data = await agentAPI(
          "/api/agency-agent/dashboard",
          "GET",
          token
        );
        const stats = data.data.statistics;
        const totalRevenue =
          data.data.recentTransactions?.reduce(
            (sum: number, t: any) => sum + Number(t.vehicleOwnerAmount || 0),
            0
          ) || 0;

        setDashboard({
          ...stats,
          totalRevenue,
          recentTransactions: data.data.recentTransactions || [],
        });
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  return (
    <div className="px-4 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Agency Agent Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick summary of your transactions and activities.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.totalTransactions || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{dashboard?.totalRevenue?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dashboard?.pendingTransactions || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboard?.failedTransactions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/agency/agents/search">
              <Search className="h-4 w-4 mr-2" /> Search Vehicle
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/agency/agents/transactions">
              <FileText className="h-4 w-4 mr-2" /> View Transactions
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/agency/agents/commission">
              <BadgePercent className="h-4 w-4 mr-2" /> View Discounts
            </Link>
          </Button>
        </CardContent>
      </Card>
      {/* Recent Transactions */}
      {dashboard?.recentTransactions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest activities by this agent
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Plate Number</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Commission</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentTransactions.slice(0, 5).map((txn: any) => (
                  <tr key={txn.id} className="border-b hover:bg-muted/40">
                    <td className="px-4 py-2">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {txn.vehicle?.plateNumber || "—"}
                    </td>
                    <td className="px-4 py-2">
                      ₦{Number(txn.vehicleOwnerAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-green-600">
                      ₦{Number(txn.agentCommission).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          txn.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : txn.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
