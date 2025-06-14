import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/actions/vehicles";

interface VehicleHeaderProps {
  vehicle: Vehicle;
}

export default function VehicleHeader({ vehicle }: VehicleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/vehicles" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {vehicle.plateNumber}
          </h1>
          <p className="text-muted-foreground">Vehicle Details & Information</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Vehicle
          </Link>
        </Button>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
