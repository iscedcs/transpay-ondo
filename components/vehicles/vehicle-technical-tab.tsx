"use client";

import type React from "react";

import { useState } from "react";
import { Settings, Navigation, Eye, EyeOff, Scan } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/barcode-scanner";
import type { Vehicle } from "@/actions/vehicles";

interface VehicleTechnicalTabProps {
  vehicle: Vehicle;
}

export default function VehicleTechnicalTab({
  vehicle,
}: VehicleTechnicalTabProps) {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const handleBarcodeAdded = (barcode: string) => {
    // This will be handled by the BarcodeScanner component
    // which will make the API call and refresh the page
    setShowBarcodeScanner(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Technical Specifications
          </CardTitle>
          <CardDescription>
            Technical details and identification codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                VIN
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">
                  {showSensitiveInfo
                    ? vehicle.vin || "Not provided"
                    : "••••••••••••••••••"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  className="h-6 w-6 p-0"
                >
                  {showSensitiveInfo ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Barcode
              </Label>
              {vehicle.barcode ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">{vehicle.barcode.code}</p>
                  <Badge variant="outline" className="text-xs">
                    {/* @ts-expect-error: garri */}
                    {new Date(vehicle.barcode.isUsed).toLocaleDateString()}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No barcode assigned
                  </p>
                  <Button
                    onClick={() => setShowBarcodeScanner(true)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Scan className="h-4 w-4" />
                    Add Barcode
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                FairFlex IMEI
              </Label>
              <p className="text-sm font-mono">
                {vehicle.fairFlexImei || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                V-Code
              </Label>
              <p className="text-sm font-mono">
                {vehicle.vCode || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Security Code
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">
                  {showSensitiveInfo
                    ? vehicle.securityCode || "Not provided"
                    : "••••••••"}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Group ID
              </Label>
              <p className="text-sm font-mono">
                {vehicle.groupId || "Not assigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracker Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Tracker Information
          </CardTitle>
          <CardDescription>GPS tracking and location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicle.tracker ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Tracker ID
                </Label>
                <p className="text-sm font-mono">{vehicle.tracker.trackerId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <Badge variant="outline">{vehicle.tracker.status}</Badge>
              </div>
              {vehicle.tracker.lastLocation && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Location
                  </Label>
                  <p className="text-sm">{vehicle.tracker.lastLocation}</p>
                </div>
              )}
              {vehicle.tracker.lastUpdate && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Update
                  </Label>
                  <p className="text-sm">
                    {new Date(vehicle.tracker.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tracker assigned to this vehicle
            </p>
          )}
        </CardContent>
      </Card>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <BarcodeScanner
            vehicleId={vehicle.id}
            onSuccess={handleBarcodeAdded}
            onCancel={() => setShowBarcodeScanner(false)}
          />
        </div>
      )}
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
