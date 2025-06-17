import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FundVehicleFlow } from "@/components/fund-vehicle-flow";

export default function FundVehiclePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Fund Vehicle</h1>
          <p className="text-muted-foreground mt-2">
            Search for a vehicle and fund it using bank transfer to a temporary
            virtual account
          </p>
        </div>

        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <FundVehicleFlow />
        </Suspense>
      </div>
    </div>
  );
}
