import { fetchVehicleTypes } from "@/actions/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Car } from "lucide-react";

export async function VehicleTypes() {
  const data = await fetchVehicleTypes();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Types
        </CardTitle>
        <CardDescription>Distribution of vehicles by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((vehicle: any) => {
            const maxCount = Math.max(...data.map((v: any) => v.count));
            const percentage = (vehicle.count / maxCount) * 100;

            return (
              <div key={vehicle.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{vehicle.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {vehicle.count}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
