import { getMonthlyRevenueChange } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export async function MonthlyRevenueChange() {
  const data = await getMonthlyRevenueChange();
  const revenueChange = data.currentMonthRevenue - data.lastMonthRevenue;
  const revenueChangePercent =
    (revenueChange / data.lastMonthRevenue) * 100 || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
        {data.change === "HIGHER" ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(data.currentMonthRevenue)}
        </div>
        <p
          className={`text-xs ${
            data.change === "HIGHER"
              ? "text-green-600"
              : data.change === "SAME"
              ? "text-orange-400"
              : "text-red-600"
          }`}
        >
          {data.change === "HIGHER" ? "+" : ""}
          {revenueChangePercent}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
