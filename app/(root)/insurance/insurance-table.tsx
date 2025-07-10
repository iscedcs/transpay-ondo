import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Shield,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Currency,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { VehicleInsuranceData } from "./types";

interface InsuranceTableProps {
  vehicles: VehicleInsuranceData[];
}

export function InsuranceTable({ vehicles }: InsuranceTableProps) {
  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "PREMIUM":
        return "default";
      case "BASIC":
        return "outline";
      default:
        return "destructive";
    }
  };

  const getEligibilityBadgeVariant = (isEligible: boolean) => {
    return isEligible ? "default" : "destructive";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEligibilityProgress = (daysPaid: number) => {
    return Math.min((daysPaid / 90) * 100, 100);
  };

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              No insurance records found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-medium bg-primary/10">
                    {vehicle.plateNumber.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {vehicle.plateNumber}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={getPlanBadgeVariant(vehicle.planName)}>
                      {vehicle.planName}
                    </Badge>
                    <Badge
                      variant={getEligibilityBadgeVariant(vehicle.isEligible)}
                    >
                      {vehicle.isEligible ? "Eligible" : "Not Eligible"}
                    </Badge>
                    {vehicle.isActive && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Payment History</DropdownMenuItem>
                  <DropdownMenuItem>Process Claim</DropdownMenuItem>
                  <DropdownMenuItem>Change Plan</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    {vehicle.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Currency className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Daily Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(vehicle.dailyCost)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Enrolled:</span>
                  <span>{formatDate(vehicle.enrollmentDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="truncate">{vehicle.ownerName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Eligibility Progress
                    </span>
                    <span className="font-medium">
                      {vehicle.totalDaysPaid}/90 days
                    </span>
                  </div>
                  <Progress
                    value={getEligibilityProgress(vehicle.totalDaysPaid)}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {vehicle.isEligible ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">
                    {vehicle.isEligible
                      ? `Eligible since ${formatDate(vehicle.eligibilityDate!)}`
                      : `${90 - vehicle.totalDaysPaid} days remaining`}
                  </span>
                </div>

                {vehicle.lastPaymentDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Payment:</span>
                    <span>{formatDate(vehicle.lastPaymentDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Coverage:</span>
                  <div className="flex gap-1">
                    {vehicle.coverage.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-muted-foreground">
                  LGA: <span className="font-medium">{vehicle.lgaName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
