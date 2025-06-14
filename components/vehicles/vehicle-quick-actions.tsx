import Link from "next/link";
import { Edit, Shield, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/actions/vehicles";

interface VehicleQuickActionsProps {
  vehicle: Vehicle;
}

export default function VehicleQuickActions({
  vehicle,
}: VehicleQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" asChild className="w-full justify-start">
          <Link href={`/vehicles/${vehicle.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Vehicle
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Shield className="h-4 w-4 mr-2" />
          {vehicle.blacklisted ? "Remove Blacklist" : "Blacklist Vehicle"}
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <CreditCard className="h-4 w-4 mr-2" />
          View Payment History
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Wallet className="h-4 w-4 mr-2" />
          Manage Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
