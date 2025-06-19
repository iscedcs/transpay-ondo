import { Suspense } from "react";
import { SearchVehicles } from "@/components/search-vehicles";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Vehicles</h1>
          <p className="text-muted-foreground">
            Find vehicles using basic or advanced search criteria
          </p>
        </div>
      </div>

      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchVehicles enableAdvancedSearch={true} />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="p-5 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
