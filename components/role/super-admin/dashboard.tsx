import {
  getPaymentTotals,
  getPaymentTotalsForStickers,
} from "@/actions/payment-notification";
import { getVehicleCategoriesCounts } from "@/actions/vehicles";
import { DashboardAdminSummary } from "@/components/role/super-admin/dashboard-admin-summary";
import RevenueAmountCardNew from "@/components/role/super-admin/revenue-amount-card";
import VehiclePieChart from "@/components/shared/chats/pie-chart";
import VehicleTypesProgress from "@/components/shared/chats/vehicle-type-progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { DashboardAgentSummary } from "./dashboard-agent-summary";
import { DashboardVehiclesSummary } from "./dashboard-vehicles-summary";

export default async function DashboardSuperAdmin() {
  const CVOF = await getPaymentTotals({ revenueType: "CVOF" });
  const ISCE = await getPaymentTotalsForStickers({ revenueType: "ISCE" });
  const FAREFLEX = await getPaymentTotals({ revenueType: "FAREFLEX" });

  const categoryCounts = await getVehicleCategoriesCounts();

  const pieChartData = Object.keys(categoryCounts.categories ?? {}).map(
    (category) => ({
      name: category,
      value: categoryCounts.categories?.[category] ?? 0,
    })
  );

  const redenderRevenueCards = (
    data: any,
    revenueType: "CVOF" | "ISCE" | "FAREFLEX"
  ) => (
    <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <Suspense
        fallback={
          <Skeleton className="flex h-24 w-full flex-col justify-between rounded-2xl bg-secondary p-3 shadow-md" />
        }
      >
        <RevenueAmountCardNew
          link={`/dashboard`}
          type="TOTAL"
          title="All Time Revenue"
          desc="All time"
          total={Number(data.allTimeTotal)}
        />
        <RevenueAmountCardNew
          link={`/dashboard/history/yearly?revenue=${revenueType}`}
          type="YEAR"
          title="Year Till Date Revenue"
          desc="Year till date"
          total={Number(data.yearToDateTotal)}
        />
        <RevenueAmountCardNew
          link={`/dashboard/history/monthly?revenue=${revenueType}`}
          type="MONTH"
          title="Month Till Date Revenue"
          desc="Month till date"
          total={Number(data.monthToDateTotal)}
        />
        <RevenueAmountCardNew
          link={`/dashboard/history/weekly?revenue=${revenueType}`}
          type="WEEK"
          title="Week Till Date Revenue"
          desc="Week till date"
          total={Number(data.weekToDateTotal)}
        />
        <RevenueAmountCardNew
          link={`/dashboard/history/daily?revenue=${revenueType}`}
          type="DAY"
          title="Day Till Date Revenue"
          desc="Day till date"
          total={Number(data.dayToDateTotal)}
        />
      </Suspense>
    </div>
  );
  return (
    <div className="w-full">
      <Tabs defaultValue="cvof">
        <TabsList className="mb-5">
          <TabsTrigger value="cvof">CVOF</TabsTrigger>
          <TabsTrigger value="isce">Sticker Payment</TabsTrigger>
          <TabsTrigger value="fareflex">Fareflex Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="cvof">
          {redenderRevenueCards(CVOF, "CVOF")}
        </TabsContent>

        <TabsContent value="isce">
          {redenderRevenueCards(ISCE, "ISCE")}
        </TabsContent>

        <TabsContent value="fareflex">
          {redenderRevenueCards(FAREFLEX, "FAREFLEX")}
        </TabsContent>
      </Tabs>
      <Separator className="my-5" />
      <div className="grid w-full gap-5 md:grid-cols-3">
        <DashboardVehiclesSummary />
        <DashboardAdminSummary />
        <DashboardAgentSummary />
      </div>
      <Separator className="my-5" />
      <div className="grid w-full gap-5 xl:grid-cols-2">
        <VehiclePieChart data={pieChartData} />
        <VehicleTypesProgress
          data={
            "error" in categoryCounts
              ? { totalVehicles: 0, categories: {} }
              : categoryCounts
          }
        />
      </div>
    </div>
  );
}
