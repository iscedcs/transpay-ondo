import type React from "react";
import { Car, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Vehicle } from "@/actions/vehicles";

interface VehicleDetailsTabProps {
  vehicle: Vehicle;
}

export default function VehicleDetailsTab({ vehicle }: VehicleDetailsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
          <CardDescription>
            Basic vehicle details and specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Plate Number
              </Label>
              <p className="text-sm font-mono">{vehicle.plateNumber}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Color
              </Label>
              <p className="text-sm">{vehicle.color}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Category
              </Label>
              <p className="text-sm">
                {vehicle.category.split("_").join(" ").toUpperCase()}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Type
              </Label>
              <p className="text-sm">{vehicle.type.replace(/_/g, " ")}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                State Code
              </Label>
              <p className="text-sm">{vehicle.stateCode}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <Badge variant={"outline"}>{vehicle.status.toUpperCase()}</Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Vehicle ID
              </Label>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {vehicle.id}
              </p>
            </div>
            {vehicle.startDate && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Start Date
                </Label>
                <p className="text-sm">
                  {new Date(vehicle.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Registration Information
          </CardTitle>
          <CardDescription>
            LGA registration and location details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Registered LGA
              </Label>
              <p className="text-sm">
                {vehicle.registeredLga?.name || "Not assigned"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                LGA ID
              </Label>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {vehicle.registeredLgaId || "Not assigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
