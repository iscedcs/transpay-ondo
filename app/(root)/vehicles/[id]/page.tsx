import { Suspense } from "react";
import { notFound } from "next/navigation";
import type React from "react";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getVehicleById } from "@/actions/vehicles";
import Link from "next/link";
import { cn } from "@/lib/utils";
import VehicleHeader from "@/components/vehicles/vehicle-header";
import VehicleSidebar from "@/components/vehicles/vehicle-sidebar";
import VehicleDetailTabs from "@/components/vehicles/vehicle-detail-tabs";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const id = (await params).id;
  // Fetch vehicle data
  let vehicle;
  let error = null;

  try {
    vehicle = await getVehicleById(id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch vehicle";
    console.error("Error fetching vehicle:", err);
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/vehicles"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex items-center gap-2"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle not found
  if (!vehicle) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <VehicleHeader vehicle={vehicle} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle Profile Card */}
        <div className="lg:col-span-1">
          <Suspense fallback={<SidebarSkeleton />}>
            <VehicleSidebar vehicle={vehicle} />
          </Suspense>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Suspense fallback={<TabsSkeleton />}>
            <VehicleDetailTabs vehicle={vehicle} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Skeleton loaders
function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-8 w-64" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-[150px] w-full rounded-lg" />
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
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
