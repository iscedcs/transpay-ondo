"use client";
import { fetchLGARevenue } from "@/actions/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { MapPin } from "lucide-react";
import React, { useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function LGARevenue() {
  const [data, setData] = React.useState<any>([]);
  useEffect(() => {
    async function loadData() {
      const fetchedData = await fetchLGARevenue();
      setData(fetchedData);
    }
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Revenue by LGA
        </CardTitle>
        <CardDescription>
          Revenue distribution across Local Government Areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="aspect-video">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="lgaName"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₦${value / 1000}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  formatCurrency(value as number),
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="totalRevenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
