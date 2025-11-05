"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { API, URLS } from "@/lib/const";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2, TrendingUp, Clock, Percent } from "lucide-react";

export default function CommissionPage() {
  const { data: session } = useSession();
  const token = session?.user?.access_token;

  const [stats, setStats] = useState<any>(null);
  const [discount, setDiscount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommissionData = async () => {
    try {
      const [transactionsRes, discountRes] = await Promise.all([
        axios.get(`${API}${URLS.agency_agent.dashboard}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}${URLS.agency_agent.discount}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (transactionsRes.data?.success) {
        const statsData = transactionsRes.data.data.statistics;
        const recentTxns = transactionsRes.data.data.recentTransactions || [];

        const pendingCommission = recentTxns
          .filter((t: any) => t.status === "PENDING")
          .reduce(
            (sum: number, t: any) => sum + Number(t.agentCommission || 0),
            0
          );

        setStats({
          ...statsData,
          pendingCommission,
        });
      }

      if (discountRes.data?.success) {
        setDiscount(discountRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load commission info", {
        description: err?.response?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCommissionData();
  }, [token]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading commission
        details...
      </div>
    );

  return (
    <div className="px-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          My Commission
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your total earnings and pending payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Earned</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₦{Number(stats?.totalCommission || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Payments</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₦{Number(stats?.pendingCommission || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From pending transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Discount Rate</CardTitle>
            <Percent className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {discount?.discountPercentage ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {discount?.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
