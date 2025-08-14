"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Users, Car, Scan } from "lucide-react";
import { LGABoundaryMap } from "./lga-boundary-map";
import {
  getLGAAgents,
  getLGAVehicles,
  getLGAScans,
  getLGARoutes,
} from "@/lib/lga-data";
import { STATE_CONFIG } from "@/lib/constants";
import type { LGA, LGAAgent, LGAVehicle, LGAScan, LGARoute } from "@/types/lga";

interface LGAViewDrawerProps {
  lga: LGA | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LGAViewDrawer({ lga, isOpen, onClose }: LGAViewDrawerProps) {
  const [agents, setAgents] = useState<LGAAgent[]>([]);
  const [vehicles, setVehicles] = useState<LGAVehicle[]>([]);
  const [scans, setScans] = useState<LGAScan[]>([]);
  const [routes, setRoutes] = useState<LGARoute[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lga && isOpen) {
      loadLGAData();
    }
  }, [lga, isOpen]);

  const loadLGAData = async () => {
    if (!lga) return;

    setLoading(true);
    try {
      const [agentsData, vehiclesData, scansData, routesData] =
        await Promise.all([
          getLGAAgents(lga.id),
          getLGAVehicles(lga.id),
          getLGAScans(lga.id),
          getLGARoutes(lga.id),
        ]);

      setAgents(agentsData);
      setVehicles(vehiclesData);
      setScans(scansData);
      setRoutes(routesData);
    } catch (error) {
      // TODO: Handle error (e.g., show toast notification)
    } finally {
      setLoading(false);
    }
  };

  if (!lga) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: STATE_CONFIG.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "compliant":
        return "default";
      case "suspended":
      case "non_compliant":
        return "destructive";
      case "grace_period":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getScanResultBadgeVariant = (result: string) => {
    switch (result) {
      case "compliant":
        return "default";
      case "violation":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:w-[900px] max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lga.name}</SheetTitle>
          <SheetDescription>
            Local Government Area details and management
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="scans">Scans</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LGA Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    LGA Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Name:</span>
                      <span>{lga.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">State:</span>
                      <span>{lga.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Levy Fee:</span>
                      <Badge variant="outline">{formatCurrency(lga.fee)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Created:</span>
                      <span className="text-sm">
                        {lga.createdAt.split("T")[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Updated:</span>
                      <span className="text-sm">
                        {lga.updatedAt.split("T")[0]}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Agents</span>
                    </div>
                    <span className="font-medium">{lga.agentCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vehicles</span>
                    </div>
                    <span className="font-medium">{lga.vehicleCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Scans</span>
                    </div>
                    <span className="font-medium">{lga.scanCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boundary Map */}
            <LGABoundaryMap boundary={lga.boundary} />
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          {agent.name}
                        </TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>{agent.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(agent.status)}>
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {agent.assignedAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Registered Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.plateNumber}
                        </TableCell>
                        <TableCell>{vehicle.category}</TableCell>
                        <TableCell>{vehicle.ownerName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(vehicle.status)}
                          >
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.lastPayment?.toLocaleDateString() || "-"}
                        </TableCell>
                        <TableCell>
                          {vehicle.registeredAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scans">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>{scan.agentName}</TableCell>
                        <TableCell className="font-medium">
                          {scan.plateNumber}
                        </TableCell>
                        <TableCell>{scan.scanType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getScanResultBadgeVariant(scan.result)}
                          >
                            {scan.result}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {scan.location.lat.toFixed(4)},{" "}
                          {scan.location.lng.toFixed(4)}
                        </TableCell>
                        <TableCell>{scan.timestamp.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle>Transport Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Start Point</TableHead>
                      <TableHead>End Point</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Vehicle Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">
                          {route.name}
                        </TableCell>
                        <TableCell>{route.startPoint}</TableCell>
                        <TableCell>{route.endPoint}</TableCell>
                        <TableCell>{route.distance} km</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {route.vehicleTypes.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="text-xs"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(route.status)}>
                            {route.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {route.createdAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
