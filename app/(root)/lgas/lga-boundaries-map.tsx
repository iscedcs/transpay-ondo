"use client";

import { LGA, VehicleFee } from "@/actions/lga";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Currency, Layers, MapPin, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.ZoomControl),
  { ssr: false }
);

// Color palette for different LGAs
const BOUNDARY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
];

interface LGABoundariesMapProps {
  lgas: LGA[];
  loading: boolean;
}

export function LGABoundariesMap({ lgas, loading }: LGABoundariesMapProps) {
  const [selectedLGA, setSelectedLGA] = useState<LGA | null>(null);
  const [hoveredLGA, setHoveredLGA] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  // Nigeria center coordinates
  const defaultCenter: [number, number] = [6.5, 5.8];

  // Convert LGA boundary data to GeoJSON format
  const processedBoundaries = useMemo(() => {
    return lgas.map((lga, index) => {
      // Convert boundary coordinates to GeoJSON format
      const geoJsonFeature = {
        type: "Feature" as const,
        properties: {
          id: lga.id,
          name: lga.name,
          fees: lga.fee,
          createdAt: lga.createdAt,
          updatedAt: lga.updatedAt,
          deletedAt: lga.deletedAt,
        },
        geometry: {
          type: lga.boundary.type as "Polygon" | "MultiPolygon",
          coordinates: lga.boundary.coordinates,
        },
      };

      return {
        lga,
        geoJson: geoJsonFeature,
        color: BOUNDARY_COLORS[index % BOUNDARY_COLORS.length],
        id: lga.id,
      };
    });
  }, [lgas]);

  // Handle LGA selection
  const handleLGAClick = useCallback((lga: LGA) => {
    setSelectedLGA(lga);
  }, []);

  // Format fees for display
  const formatFees = (fees: VehicleFee[]) => {
    if (!Array.isArray(fees) || fees.length === 0) return "No fees set";
    return fees
      .map((fee) => `${fee.vehicleCategory}: ₦${fee.fee.toLocaleString()}`)
      .join(", ");
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle map type
  const toggleMapType = () => {
    setMapType(mapType === "standard" ? "satellite" : "standard");
  };

  // Add Leaflet CSS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="grid grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (lgas.length === 0) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <MapPin className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            No LGA boundaries to display
          </h3>
          <p className="text-gray-600">
            Import some LGAs to see their boundaries on the map.
          </p>
        </div>
      </div>
    );
  }

  if (typeof window === "undefined") {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMapType}
          className="bg-white shadow-lg">
          <Layers className="h-4 w-4 mr-2" />
          {mapType === "satellite" ? "Map View" : "Satellite View"}
        </Button>
      </div>

      {/* Map Container */}
      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer
          // @ts-expect-error: ignore style error
          center={defaultCenter}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}>
          <ZoomControl position="bottomright" />

          {/* Base map layer */}
          {mapType === "standard" ? (
            <TileLayer
              // @ts-expect-error: ignore style error
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              // @ts-expect-error: ignore style error
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* Render LGA boundaries as GeoJSON */}
          {processedBoundaries.map((boundary) => (
            <GeoJSON
              key={boundary.id}
              data={boundary.geoJson}
              // @ts-expect-error: ignore style error
              style={() => ({
                fillColor:
                  selectedLGA?.id === boundary.id ? "#ff0000" : boundary.color,
                weight: hoveredLGA === boundary.id ? 3 : 2,
                opacity: 1,
                color: "white",
                dashArray: boundary.lga.deletedAt ? "5,5" : undefined,
                fillOpacity: hoveredLGA === boundary.id ? 0.8 : 0.6,
              })}
              onEachFeature={(feature: any, layer: any) => {
                layer.on({
                  click: () => {
                    handleLGAClick(boundary.lga);
                  },
                  mouseover: () => {
                    setHoveredLGA(boundary.id);
                  },
                  mouseout: () => {
                    setHoveredLGA(null);
                  },
                });

                // Create tooltip content
                const tooltipContent = `
                  <div class="p-2">
                    <div class="font-semibold">${boundary.lga.name}</div>
                    <div class="text-sm text-gray-600">
                      ${
                        boundary.lga.deletedAt
                          ? "Status: Deleted"
                          : "Status: Active"
                      }
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      Click for details
                    </div>
                  </div>
                `;
                layer.bindTooltip(tooltipContent);
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Map Legend
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded opacity-60"></div>
            <span>Active LGA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded opacity-60 border-dashed border-2"></div>
            <span>Deleted LGA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Selected LGA</span>
          </div>
          <div className="text-gray-600 mt-2">
            Click on any boundary to view details
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{lgas.filter((lga) => !lga.deletedAt).length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{lgas.filter((lga) => lga.deletedAt).length} Deleted</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-gray-600" />
            <span>{lgas.length} Total</span>
          </div>
        </div>
      </div>

      {/* LGA Details Panel */}
      {selectedLGA && (
        <div className="absolute bottom-4 right-4 z-[1000] max-w-sm">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {selectedLGA.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLGA(null)}
                  className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  variant={selectedLGA.deletedAt ? "destructive" : "default"}>
                  {selectedLGA.deletedAt ? "Deleted" : "Active"}
                </Badge>
              </div>

              {/* Boundary Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Boundary Type:</span>
                <Badge variant="outline">{selectedLGA.boundary.type}</Badge>
              </div>

              {/* Vehicle Fees */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Currency className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Vehicle Fees</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                  {Array.isArray(selectedLGA.fee) &&
                  selectedLGA.fee.length > 0 ? (
                    <div className="space-y-1">
                      {selectedLGA.fee.map((fee, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {fee.vehicleCategory}:
                          </span>
                          <span className="font-medium">
                            ₦{fee.fee.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No fees configured
                    </span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Timeline</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Created: {formatDate(selectedLGA.createdAt)}</div>
                  <div>Updated: {formatDate(selectedLGA.updatedAt)}</div>
                  {selectedLGA.deletedAt && (
                    <div className="text-red-600">
                      Deleted: {formatDate(selectedLGA.deletedAt)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
