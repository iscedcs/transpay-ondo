"use client";

import type React from "react";

import type { Vehicle } from "@/actions/vehicles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Navigation,
  Settings,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import BarcodeAdder from "../layout/barcode-adder";
import { VehicleRoutesManager } from "../vehicle-routes-manager";

interface VehicleTechnicalTabProps {
  vehicle: Vehicle;
}

export default function VehicleTechnicalTab({
  vehicle,
}: VehicleTechnicalTabProps) {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  // Generate QR code URL
  const qrCodeUrl = vehicle.barcode
    ? `${process.env.NEXT_PUBLIC_APP_URL}${vehicle.barcode.code}`
    : null;

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const svg = document.getElementById("vehicle-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `vehicle-${vehicle.plateNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{vehicle.barcode.code}</p>
                    <Badge variant="outline" className="text-xs">
                      {new Date(
                        String(vehicle.barcode.isUsed?.split("T")[0])
                      ).toLocaleDateString()}
                    </Badge>
                  </div>

                  {/* QR Code Display */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-white rounded-lg border">
                        <QRCodeSVG
                          id="vehicle-qr-code"
                          value={qrCodeUrl!}
                          size={120}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(qrCodeUrl!, "_blank")}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadQRCode}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        QR Code URL
                      </Label>
                      <p className="text-xs font-mono text-blue-600 break-all">
                        {qrCodeUrl}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scan this QR code to access vehicle information
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No barcode assigned
                  </p>
                  <BarcodeAdder id={vehicle.id} />
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

      {/* Vehicle Routes Management */}
      <VehicleRoutesManager vehicleId={vehicle.id} />

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
