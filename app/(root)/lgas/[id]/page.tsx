import {
  VehicleFee,
  getLGAById,
  getLGARoutes,
  getLGAScans,
  getLGAUsers,
  getLGAVehicles,
} from "@/actions/lga";
import { getMe } from "@/actions/users";
import PolygonMapViewer from "@/components/polygon-map-viewer";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CONFIG from "@/config";
import { ADMIN_ROLES } from "@/lib/const";
import { cn, formatFees } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Car,
  Edit,
  MapPin,
  Route,
  Scan,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function LGAPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const id = (await params).id;
  const currentUser = (await getMe()).user;

  if (!currentUser) {
    redirect("/sign-in");
  }

  // Check access permissions
  if (!ADMIN_ROLES.includes(currentUser.role)) {
    redirect("/dashboard?error=unauthorized");
  }

  const lga = await getLGAById(id);

  if (!lga) {
    notFound();
  }

  // Load all LGA data
  const [users_res, vehicles_res, scans_res, routes_res] = await Promise.all([
    getLGAUsers(lga.id),
    getLGAVehicles(lga.id),
    getLGAScans(lga.id),
    getLGARoutes(lga.id),
  ]);
  const users = users_res.data;
  const vehicles = vehicles_res.data;
  const scans = scans_res;
  const routes = routes_res.data;

  const canEdit = ADMIN_ROLES.includes(currentUser.role);
  const canDelete = ADMIN_ROLES.includes(currentUser.role);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "compliant":
        return "default";
      case "suspended":
        return "destructive";
      case "non_compliant":
        return "destructive";
      case "grace_period":
        return "destructive";
      default:
        return "outline";
    }
  };

  const optionalLocations = scans.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/lgas">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to LGAs
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{lga.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">Edo State</Badge>
                <Badge className="text-foreground">
                  {formatFees(JSON.parse(lga.fee) as VehicleFee[])} levy
                </Badge>
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-2">
              {canEdit && <LGAEditButton lga={lga} />}
              {canDelete && <LGADeleteButton lga={lga} />}
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assigned Agents
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter((a) => a.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registered Vehicles
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-muted-foreground">
                {vehicles.filter((v) => v.status === "compliant").length}{" "}
                compliant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compliance Scans
              </CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scans.meta.count}</div>
              <p className="text-xs text-muted-foreground">
                {scans.data.filter((s) => s.declaredRouteHit).length} passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transport Routes
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routes.length}</div>
              <p className="text-xs text-muted-foreground">
                {routes.length} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* LGA Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  LGA Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Name
                    </div>
                    <div className="text-lg font-semibold">{lga.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      State
                    </div>
                    <div className="text-lg font-semibold">
                      {CONFIG.stateName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Daily Levy Fee
                    </div>
                    <div className="text-lg font-semibold">
                      {formatFees(JSON.parse(lga.fee) as VehicleFee[])}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      LGA ID
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lga.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {lga.createdAt.split("T")[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Last Updated</div>
                      <div className="text-sm text-muted-foreground">
                        {lga.updatedAt.split("T")[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="agents" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="scans">Scans</TabsTrigger>
                <TabsTrigger value="routes">Routes</TabsTrigger>
              </TabsList>

              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Agents ({users.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {users.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No agents assigned to this LGA
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.firstName} {user.lastName}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone || "-"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={getStatusBadgeVariant(user.status)}
                                >
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.role}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Registered Vehicles ({vehicles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vehicles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No vehicles registered in this LGA
                      </div>
                    ) : (
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
                              <TableCell>
                                {vehicle.owner.firstName}{" "}
                                {vehicle.owner.lastName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    vehicle.status
                                  )}
                                >
                                  {vehicle.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {vehicle.wallet.lastTransactionDate.split(
                                  "T"
                                )[0] || "-"}
                              </TableCell>
                              <TableCell>
                                {vehicle.createdAt.split("T")[0]}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scans">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Scans ({scans.meta.count})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scans.meta.count === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No compliance scans recorded
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scans.data.map((scan) => (
                            <TableRow key={scan.id}>
                              <TableCell>
                                {scan.user.firstName} {scan.user.lastName}
                              </TableCell>
                              <TableCell className="font-medium">
                                {scan.vehicle.plateNumber}
                              </TableCell>
                              <TableCell>{scan.vehicle.category}</TableCell>
                              <TableCell>
                                {scan.latitude.toFixed(4)},{" "}
                                {scan.longitude.toFixed(4)}
                                {" - "} {scan.detectedLga.name}
                              </TableCell>
                              <TableCell>
                                {scan.createdAt.split("T")[0]}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="routes">
                <Card>
                  <CardHeader>
                    <CardTitle>Transport Routes ({routes.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {routes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No transport routes defined
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Route Name</TableHead>
                            <TableHead>Start Point</TableHead>
                            <TableHead>End Point</TableHead>
                            <TableHead>Vehicle Types</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routes.map((route, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {route.route.map((r) => r.lga.name).join(" - ")}
                              </TableCell>
                              <TableCell>{route.route[0].lga.name}</TableCell>
                              <TableCell>
                                {route.route[route.route.length - 1].lga.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {route.vehicle.category}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge>{"ACTIVE"}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Map and Actions */}
          <div className="space-y-6">
            {/* Boundary Map */}
            {/* <LGABoundaryMap boundary={lga.boundary} /> */}

            <PolygonMapViewer
              polygonCoordinates={lga.boundary.coordinates[0] as number[][]}
              locations={optionalLocations}
              title="LGA Boundary and Scans"
              height="300px"
              totalScan={scans.meta.count}
            />
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Agents</span>
                    <span className="font-medium">
                      {users.filter((a) => a.status === "active").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliant Vehicles</span>
                    <span className="font-medium">
                      {vehicles.filter((v) => v.status === "compliant").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Non-Compliant</span>
                    <span className="font-medium text-red-600">
                      {
                        vehicles.filter((v) => v.status === "non_compliant")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recent Scans</span>
                    <span className="font-medium">
                      {
                        scans.data.filter(
                          (s) =>
                            new Date(s.createdAt.split("T")[0]) >
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Routes</span>
                    <span className="font-medium">{routes.length}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">
                    Compliance Rate
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            vehicles.length > 0
                              ? (vehicles.filter(
                                  (v) => v.status === "compliant"
                                ).length /
                                  vehicles.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {vehicles.length > 0
                        ? Math.round(
                            (vehicles.filter((v) => v.status === "compliant")
                              .length /
                              vehicles.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scans.data.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {scan.vehicle.plateNumber}
                        </div>
                        <div className="text-muted-foreground">
                          Scanned by {scan.user.firstName} {scan.user.lastName}
                        </div>
                      </div>
                    </div>
                  ))}
                  {scans.meta.count === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client components for interactive actions
function LGAEditButton({ lga }: { lga: any }) {
  return (
    <Link
      href={`/lgas/${lga.id}/edit`}
      className={cn(buttonVariants({ variant: "outline" }), "")}
    >
      <Edit className="h-4 w-4 mr-2" />
      Edit LGA
    </Link>
  );
}

function LGADeleteButton({ lga }: { lga: any }) {
  return (
    <Button variant="outline" className="text-red-600 hover:text-red-700">
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  );
}
