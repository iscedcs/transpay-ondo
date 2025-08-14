"use client";

import { fetchVehicleDistribution } from "@/actions/dashboard";
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
import { COLORS } from "@/lib/const";
import { BarChart3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface VehicleDistributionData {
  lga: string;
  count: number;
  percentage: number;
}

export function VehicleDistribution() {
  const [data, setData] = useState<VehicleDistributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchVehicleDistribution();

        // Validate and transform data
        if (Array.isArray(result)) {
          const validData = result.filter(
            (item): item is VehicleDistributionData =>
              item &&
              typeof item.lga === "string" &&
              typeof item.count === "number" &&
              typeof item.percentage === "number"
          );
          setData(validData);
        } else {
          setData([]);
        }
      } catch (err) {
        setError("Failed to load vehicle distribution data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    count: {
      label: "Vehicles",
      color: "hsl(var(--chart-1))",
    },
  };

  const customLabel = ({ lga, count, percentage }: VehicleDistributionData) => {
    // Only show label if percentage is above 5% to avoid clutter
    if (percentage < 5) return "";
    return `${lga}: ${count} (${percentage}%)`;
  };

  const formatTooltipContent = (value: any, name: string, props: any) => {
    const { payload } = props;
    if (payload) {
      return [
        `${payload.count} vehicles (${payload.percentage}%)`,
        payload.lga,
      ];
    }
    return [`${value} vehicles`, name];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Distribution by LGA
          </CardTitle>
          <CardDescription>
            Number of registered vehicles per LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading distribution data...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Distribution by LGA
          </CardTitle>
          <CardDescription>
            Number of registered vehicles per LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vehicle Distribution by LGA
          </CardTitle>
          <CardDescription>
            Number of registered vehicles per LGA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No vehicle distribution data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Vehicle Distribution by LGA
        </CardTitle>
        <CardDescription>
          Distribution of {data.reduce((sum, item) => sum + item.count, 0)}{" "}
          registered vehicles across {data.length} LGAs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={customLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.lga}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={formatTooltipContent}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={item.lga} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">{item.lga}</span>
              <span className="text-muted-foreground">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
