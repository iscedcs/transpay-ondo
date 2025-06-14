import { Car, MapPin, User, Shield, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { type Vehicle } from "@/actions/vehicles";
import VehicleWalletSummary from "./vehicle-wallet-summary";
import VehicleQuickActions from "./vehicle-quick-actions";

interface VehicleSidebarProps {
  vehicle: Vehicle;
}

export default function VehicleSidebar({ vehicle }: VehicleSidebarProps) {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 rounded-lg">
              <AvatarImage
                src={vehicle.image || "/placeholder.svg"}
                alt={vehicle.plateNumber}
                className="object-cover"
              />
              <AvatarFallback className="text-lg rounded-lg">
                <Car className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-2 space-x-2">
              <h2 className="text-xl font-semibold">{vehicle.plateNumber}</h2>
              <Badge variant="outline" className="text-sm">
                {vehicle.category.split("_").join(" ").toUpperCase()}
              </Badge>
              <Badge variant={"outline"} className="text-sm">
                {vehicle.status.toUpperCase()}
              </Badge>
              {vehicle.blacklisted && (
                <Badge variant="destructive" className="text-sm">
                  Blacklisted
                </Badge>
              )}
            </div>

            <Separator />

            {/* Quick Info */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  {vehicle.color} {vehicle.type}
                </span>
              </div>
              {vehicle.owner && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {vehicle.owner.firstName} {vehicle.owner.lastName}
                  </span>
                </div>
              )}
              {vehicle.registeredLga && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{vehicle.registeredLga.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>{vehicle.stateCode}</span>
              </div>
              {vehicle.vCode && (
                <div className="flex items-center gap-3 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{vehicle.vCode}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Important Dates */}
            <div className="w-full space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span>{formatDate(vehicle.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated:</span>
                <span>{formatDate(vehicle.updatedAt)}</span>
              </div>
              {vehicle.startDate && (
                <div className="flex items-center justify-between">
                  <span>Start Date:</span>
                  <span>{formatDate(vehicle.startDate)}</span>
                </div>
              )}
              {vehicle.last_payment_date && (
                <div className="flex items-center justify-between">
                  <span>Last Payment:</span>
                  <span>{formatDate(vehicle.last_payment_date)}</span>
                </div>
              )}
              {vehicle.deletedAt && (
                <div className="flex items-center justify-between text-red-600">
                  <span>Deleted:</span>
                  <span>{formatDate(vehicle.deletedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary Card */}
      {vehicle.wallet && <VehicleWalletSummary wallet={vehicle.wallet} />}

      {/* Quick Actions Card */}
      <VehicleQuickActions vehicle={vehicle} />
    </div>
  );
}
