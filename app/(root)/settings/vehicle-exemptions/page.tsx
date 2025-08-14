"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Car, Plus } from "lucide-react";
import Link from "next/link";
import { VehicleExemptionDialog } from "@/components/vehicle-settings/vehicle-exemption-dialog";
import { ExemptedVehiclesTable } from "@/components/vehicle-settings/exempted-vehicles-table";

export default function VehicleExemptionsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExemptionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings/vehicle-settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vehicle Exemptions
            </h1>
            <p className="text-muted-foreground">
              Manage individual vehicle CVOF payment exemptions
            </p>
          </div>
        </div>
        <VehicleExemptionDialog onSuccess={handleExemptionSuccess} />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              CVOF Exemptions
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Individual vehicle exemptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exemption Types
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                NO_CVOF_PAYMENT
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available exemption categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <VehicleExemptionDialog onSuccess={handleExemptionSuccess} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Manage exemptions quickly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exempted Vehicles Table */}
      <ExemptedVehiclesTable refreshTrigger={refreshTrigger} />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Vehicle Exemptions Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Adding Exemptions
              </h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Enter a valid vehicle UUID to check current status</li>
                <li>
                  Click "Add Exemption" to exempt the vehicle from CVOF payments
                </li>
                <li>Exemptions take effect immediately</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Managing Exemptions
              </h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>View all exempted vehicles in the table below</li>
                <li>Remove exemptions by clicking the shield icon</li>
                <li>Search vehicles by ID or plate number</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
