"use client";

import { useState } from "react";
import { scanVehicle } from "@/actions/scan";
import { LocationPermission } from "@/components/location-permission";
import { ScanResults } from "@/components/scan-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";

interface AuthenticatedScanViewProps {
  qrId: string;
  user: any; // Replace with your user type
}

interface Location {
  latitude: number;
  longitude: number;
}

interface ScanState {
  isScanning: boolean;
  hasLocation: boolean;
  scanResult: any | null;
  error: string | null;
}

export function AuthenticatedScanView({
  qrId,
  user,
}: AuthenticatedScanViewProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [scanState, setScanState] = useState<ScanState>({
    isScanning: false,
    hasLocation: false,
    scanResult: null,
    error: null,
  });

  const handleLocationReceived = (loc: Location) => {
    setLocation(loc);
    setScanState((prev) => ({ ...prev, hasLocation: true, error: null }));
    // Automatically perform scan once location is acquired
    performScanWithLocation(loc);
  };

  const handleLocationError = (error: string) => {
    setScanState((prev) => ({ ...prev, error, hasLocation: false }));
  };

  const performScanWithLocation = async (loc: Location) => {
    setScanState((prev) => ({ ...prev, isScanning: true, error: null }));

    try {
      const result = await scanVehicle({
        barcode: qrId,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      console.log({result})

      setScanState((prev) => ({
        ...prev,
        isScanning: false,
        scanResult: result,
      }));

      if (!result.success) {
        toast.error("Scan Failed", {
          description: result.error,
        });
        return;
      }

      toast.success("Scan Successful", {
        description: "Vehicle scanned successfully",
      });
    } catch (error) {
      console.log({error})
      const errorMessage =
        error instanceof Error ? error.message : "Failed to scan vehicle";
      setScanState((prev) => ({
        ...prev,
        isScanning: false,
        error: errorMessage,
      }));

      toast.error("Scan Failed", {
        description: errorMessage,
      });
    }
  };

  const performScan = async () => {
    if (!location) {
      toast.error("Location Required", {
        description: "Please enable location access to perform scan",
      });
      return;
    }
    await performScanWithLocation(location);
  };

  if (scanState.scanResult) {
    return <ScanResults scanResult={scanState.scanResult} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Vehicle Compliance Scan
            </CardTitle>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="default" className="text-sm">
              {user.role}: {user?.name}
            </Badge>
            <Badge variant="outline" className="text-sm">
              QR: {qrId}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Location Permission */}
      {!scanState.hasLocation && (
        <LocationPermission
          onLocationReceived={handleLocationReceived}
          onError={handleLocationError}
        />
      )}

      {/* Location Status */}
      {location && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Location Acquired</p>
                <p className="text-sm text-gray-600">
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanning Status */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🚗</div>
            {scanState.isScanning ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900">
                  Scanning Vehicle...
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Processing scan data...</span>
                </div>
              </>
            ) : scanState.hasLocation ? (
              <>
                <h3 className="text-xl font-semibold text-green-600">
                  Scan Complete
                </h3>
                <p className="text-gray-600">
                  Vehicle scan has been processed successfully.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900">
                  Waiting for Location
                </h3>
                <p className="text-gray-600">
                  Please allow location access to automatically scan the
                  vehicle.
                </p>
              </>
            )}

            {scanState.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{scanState.error}</p>
                <Button
                  onClick={performScan}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Retry Scan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Automatic Scan Process:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Location will be automatically detected</li>
            <li>
              • Vehicle scan will start immediately after location is acquired
            </li>
            <li>• Ensure you are near the vehicle for accurate results</li>
            <li>• Compliance checking will be performed automatically</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
