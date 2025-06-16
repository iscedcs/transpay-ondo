"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, MapPin, Layers } from "lucide-react";
import { LGAScan } from "@/actions/lga";
import { COLORS } from "@/lib/const";

interface PolygonMapViewerProps {
  polygonCoordinates: number[][];
  locations?: LGAScan[];
  title?: string;
  height?: string;
}

// Calculate polygon bounds
function getPolygonBounds(coordinates: number[][]) {
  const lats = coordinates.map((coord) => coord[1]);
  const lngs = coordinates.map((coord) => coord[0]);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
    centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

export default function PolygonMapViewer({
  polygonCoordinates,
  locations = [],
  title = "Polygon Boundary Map",
  height = "300px",
}: PolygonMapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      // @ts-expect-error: no type declaration found
      const L = (await import("leaflet")).default;

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const bounds = getPolygonBounds(polygonCoordinates);

      // Initialize map
      const map = L.map(mapRef.current!).setView(
        [bounds.centerLat, bounds.centerLng],
        12
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Convert coordinates for Leaflet (swap lng/lat to lat/lng)
      const leafletCoords = polygonCoordinates.map(
        (coord) => [coord[1], coord[0]] as [number, number]
      );

      // Add polygon
      const polygon = L.polygon(leafletCoords, {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);

      // Add polygon popup
      polygon.bindPopup(`
        <div>
          <strong>Polygon Boundary</strong><br>
          Vertices: ${polygonCoordinates.length}<br>
          Area: Complex polygon shape
        </div>
      `);

      // Add location markers
      locations.forEach((location, index) => {
        const marker = L.marker([location.latitude, location.longitude]).addTo(
          map
        );

        const popupContent = `
          <div>
            <strong>${location.vehicle.plateNumber}</strong><br>
            ${location.user.firstName || ""} ${location.user.lastName || ""}<br>
            <small>Lat: ${location.latitude.toFixed(6)}<br>
            Lng: ${location.longitude.toFixed(6)}</small>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Custom marker color if specified
        if (COLORS[index]) {
          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color: ${COLORS[index]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          marker.setIcon(customIcon);
        }
      });

      // Fit map to show polygon and all locations
      const allPoints = [
        ...leafletCoords,
        ...locations.map(
          (loc) => [loc.latitude, loc.longitude] as [number, number]
        ),
      ];

      if (allPoints.length > 0) {
        const group = L.featureGroup(allPoints.map((point) => L.marker(point)));
        map.fitBounds(group.getBounds().pad(0.1));
      }

      mapInstanceRef.current = map;
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, polygonCoordinates]);

  const bounds = getPolygonBounds(polygonCoordinates);

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {polygonCoordinates.length} vertices
            </Badge>
            {locations.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {locations.length} location{locations.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Map Container */}
            <div
              ref={mapRef}
              style={{ height, width: "100%" }}
              className="rounded-lg border overflow-hidden"
            />

            {/* Map Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Polygon Bounds
                </h4>
                <div className="space-y-1">
                  <div>
                    Center: {bounds.centerLat.toFixed(6)},{" "}
                    {bounds.centerLng.toFixed(6)}
                  </div>
                  <div>
                    Lat Range: {bounds.minLat.toFixed(6)} to{" "}
                    {bounds.maxLat.toFixed(6)}
                  </div>
                  <div>
                    Lng Range: {bounds.minLng.toFixed(6)} to{" "}
                    {bounds.maxLng.toFixed(6)}
                  </div>
                </div>
              </div>

              {locations.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Locations
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {locations.map((location, index) => (
                      <div
                        key={location.id}
                        className="flex items-center gap-2"
                      >
                        {COLORS[index] && (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                        )}
                        <span>{location.detectedLga.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </div>
  );
}
