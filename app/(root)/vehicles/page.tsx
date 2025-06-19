import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VehiclesContent } from "@/components/vehicles/vehicle-content";

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-4 px-4 space-y-4 md:py-8 md:space-y-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  );
}
