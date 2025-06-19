"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RefreshCw,
  Download,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRevenueData, exportRevenueData } from "@/actions/revenue";
import RevenueFilters from "./revenue-filters";
import RevenueCharts from "./revenue-charts";
import RevenueTable from "./revenue-table";
import RevenueComparison from "./revenue-comparison";
import StakeholderSplit from "./stakeholder-split";

interface RevenueContentProps {
  user: any;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RevenueContent({
  user,
  searchParams,
}: RevenueContentProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Parse search params
  const lga = Array.isArray(searchParams.lga)
    ? searchParams.lga[0]
    : searchParams.lga;
  const period = Array.isArray(searchParams.period)
    ? searchParams.period[0]
    : searchParams.period || "monthly";
  const startDate = Array.isArray(searchParams.startDate)
    ? searchParams.startDate[0]
    : searchParams.startDate;
  const endDate = Array.isArray(searchParams.endDate)
    ? searchParams.endDate[0]
    : searchParams.endDate;
  const compare = searchParams.compare === "true";
  const lgas = Array.isArray(searchParams.lgas)
    ? searchParams.lgas
    : searchParams.lgas?.split(",") || [];

  const fetchData = useCallback(
    async (showRefreshToast = false) => {
      try {
        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await getRevenueData({
          userRole: user.role,
          userLgaId: user.lgaId,
          lga,
          period,
          startDate,
          endDate,
          compare,
          lgas,
        });

        setData(result);

        if (showRefreshToast) {
          toast.success("Revenue data refreshed successfully");
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
        toast.error("Failed to load revenue data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, compare, lga, startDate, endDate]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 10 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      setExporting(true);

      await exportRevenueData({
        format,
        userRole: user.role,
        userLgaId: user.lgaId,
        lga,
        period,
        startDate,
        endDate,
        compare,
        lgas,
      });

      toast.success(`Revenue data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isLGAAdmin = user.role === "LGA_ADMIN";
  const canCompare = !isLGAAdmin;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <RevenueFilters
        user={user}
        searchParams={searchParams}
        availableLGAs={data?.availableLGAs || []}
        canCompare={canCompare}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{data?.stats?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.stats?.revenueChange > 0 ? "+" : ""}
              {data?.stats?.revenueChange || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.totalTransactions?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.stats?.transactionChange > 0 ? "+" : ""}
              {data?.stats?.transactionChange || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vehicles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.stats?.activeVehicles?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicles with transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isLGAAdmin ? "LGA Share" : "Outstanding"}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLGAAdmin
                ? `${data?.stats?.lgaPercentage || 0}%`
                : `₦${data?.stats?.outstandingAmount?.toLocaleString() || "0"}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLGAAdmin ? "Of state-wide revenue" : "Owing transactions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholder Split */}
      <StakeholderSplit totalRevenue={data?.stats?.totalRevenue || 0} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="table">Detailed View</TabsTrigger>
          {canCompare && (
            <TabsTrigger value="compare">Compare LGAs</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueCharts data={data?.chartData} type="trend" />
            <RevenueCharts data={data?.chartData} type="category" />
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueCharts data={data?.chartData} type="trend" />
            <RevenueCharts data={data?.chartData} type="category" />
            <RevenueCharts data={data?.chartData} type="lga" />
            <RevenueCharts data={data?.chartData} type="period" />
          </div>
        </TabsContent>

        <TabsContent value="table">
          <RevenueTable data={data?.tableData} />
        </TabsContent>

        {canCompare && (
          <TabsContent value="compare">
            <RevenueComparison data={data?.comparisonData} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
