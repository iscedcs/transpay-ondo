"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer } from "recharts";

// Define the type for the prop data
interface VehicleTypesProgressProps {
  data: {
    totalVehicles: number;
    categories: Record<string, number>;
  };
}

export default function VehicleTypesProgress({
  data,
}: VehicleTypesProgressProps) {
  const { totalVehicles, categories } = data;
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Vehicle Type Distribution</CardTitle>
        <CardDescription>
          Breakdown of charged vehicles by amount
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%">
          <div className="justify-center space-y-4">
            {Object.keys(categories).map((category, i) => (
              <div className="flex items-center justify-start gap-4" key={i}>
                <span className="w-1/2 lg:w-1/4">{category}</span>
                <Progress
                  value={(categories[category] / totalVehicles) * 100}
                  className="hidden w-1/2 lg:inline-block"
                />
                <span>
                  {Math.floor((categories[category] / totalVehicles) * 100)}%
                </span>
                <span>{categories[category]}</span>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
