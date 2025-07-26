"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface LocationPermissionProps {
  onLocationReceived: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  onError: (error: string) => void;
}

export function LocationPermission({
  onLocationReceived,
  onError,
}: LocationPermissionProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  // const [manualLocation, setManualLocation] = useState({
  //   latitude: "",
  //   longitude: "",
  // })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Check for precision: accuracy should be <= 50 meters
        if (accuracy > 50) {
          // onError(
          //   `Location is not precise enough (accuracy: ${Math.round(
          //     accuracy
          //   )}m). Please try again with GPS enabled.`
          // );
          onError(`Please try again with GPS enabled.`);
          setIsGettingLocation(false);
          return;
        }

        onLocationReceived({ latitude, longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        onError(errorMessage);
        setIsGettingLocation(false);
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force a fresh read
      }
    );
  };

  // const handleManualSubmit = () => {
  //   const lat = Number.parseFloat(manualLocation.latitude)
  //   const lng = Number.parseFloat(manualLocation.longitude)

  //   if (isNaN(lat) || isNaN(lng)) {
  //     onError("Please enter valid latitude and longitude values")
  //     return
  //   }

  //   if (lat < -90 || lat > 90) {
  //     onError("Latitude must be between -90 and 90")
  //     return
  //   }

  //   if (lng < -180 || lng > 180) {
  //     onError("Longitude must be between -180 and 180")
  //     return
  //   }

  //   onLocationReceived({ latitude: lat, longitude: lng })
  // }

  // Auto-request location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Location Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Get Current Location
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(!showManualInput)}
            >
              Enter Location Manually
            </Button>
          </div>
        </div>

        {/* {showManualInput && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="6.5244"
                  value={manualLocation.latitude}
                  onChange={(e) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="3.3792"
                  value={manualLocation.longitude}
                  onChange={(e) =>
                    setManualLocation((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button onClick={handleManualSubmit} className="w-full" variant="outline">
              Use Manual Location
            </Button>
          </div>
        )} */}

        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium">Why do we need your location?</p>
            <p>Location data helps us verify compliance with LGA.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
