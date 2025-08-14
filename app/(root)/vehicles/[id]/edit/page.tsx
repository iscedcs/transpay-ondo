import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/actions/vehicles";
import { VehicleEditForm } from "@/components/vehicle-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLGAs } from "@/actions/lga";

interface VehicleEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleEditPage({
  params,
}: VehicleEditPageProps) {
  const { id } = await params;

  try {
    // Fetch vehicle data and LGAs in parallel
    const [vehicleResponse, lgasResponse] = await Promise.all([
      getVehicleById(id),
      getLGAs(),
    ]);

    if (!vehicleResponse.success) {
      notFound();
    }

    const vehicle = vehicleResponse.data;
    const lgas = lgasResponse.success ? lgasResponse.data : [];

    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/vehicles/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicle
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Edit3 className="h-6 w-6" />
                Edit Vehicle
              </h1>
              <p className="text-muted-foreground">
                Update vehicle information for {vehicle.plateNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/vehicles" className="hover:text-foreground">
            Vehicles
          </Link>
          <span>/</span>
          <Link href={`/vehicles/${id}`} className="hover:text-foreground">
            {vehicle.plateNumber}
          </Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </nav>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading form...</div>}>
              <VehicleEditForm vehicle={vehicle} lgas={lgas} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: VehicleEditPageProps) {
  const { id } = await params;

  try {
    const response = await getVehicleById(id);
    if (!!response.success) {
      const vehicle = response.data;
      return {
        title: `Edit ${vehicle.plateNumber} - Vehicle Management`,
        description: `Edit vehicle information for ${vehicle.plateNumber}`,
      };
    }
  } catch (error) {}

  return {
    title: "Edit Vehicle - Vehicle Management",
    description: "Edit vehicle information",
  };
}
