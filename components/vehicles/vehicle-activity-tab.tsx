import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/actions/vehicles";

interface VehicleActivityTabProps {
  vehicle: Vehicle;
}

export default function VehicleActivityTab({
  vehicle,
}: VehicleActivityTabProps) {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Vehicle Activity
        </CardTitle>
        <CardDescription>Recent activity and audit trail</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Vehicle Registered</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(vehicle.createdAt)}
              </p>
            </div>
            <Badge variant="outline">System</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(vehicle.updatedAt)}
              </p>
            </div>
            <Badge variant="outline">Update</Badge>
          </div>

          {vehicle.wallet && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Wallet Created</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.wallet.createdAt)}
                </p>
              </div>
              <Badge variant="outline">Wallet</Badge>
            </div>
          )}

          {vehicle.wallet?.lastTransactionDate && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Last Transaction</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.wallet.lastTransactionDate)}
                </p>
              </div>
              <Badge variant="outline">Transaction</Badge>
            </div>
          )}

          {vehicle.last_payment_date && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Last Payment</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.last_payment_date)}
                </p>
              </div>
              <Badge variant="outline">Payment</Badge>
            </div>
          )}

          {vehicle.startDate && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Service Started</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.startDate)}
                </p>
              </div>
              <Badge variant="outline">Service</Badge>
            </div>
          )}

          {vehicle.barcode && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Barcode Attacheded</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.barcode.isUsed)}
                </p>
              </div>
              <Badge variant="outline">Barcode</Badge>
            </div>
          )}

          {vehicle.deletedAt && (
            <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Vehicle Deleted
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(vehicle.deletedAt)}
                </p>
              </div>
              <Badge variant="destructive">Deleted</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
