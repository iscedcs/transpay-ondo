"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Car,
  Shield,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLGAs } from "@/actions/lga";
import { Vehicle, getVehicles } from "@/actions/vehicles";
import { VEHICLE_CATEGORIES } from "@/lib/const";
import { VehicleActionButtons } from "./vehicle-action-buttons";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lgaFilter, setLgaFilter] = useState<string>("all");
  const [blacklistFilter, setBlacklistFilter] = useState<string>("all");
  const [currentOffset, setCurrentOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);

  // Fetch vehicles data
  const fetchVehicles = async (
    offset: number = currentOffset,
    limit: number = pageSize
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { limit, offset };

      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (lgaFilter !== "all") params.registeredLgaId = lgaFilter;
      if (blacklistFilter !== "all")
        params.blacklisted = blacklistFilter === "true";

      const response = await getVehicles(params);
      setVehicles(response.data);
      setTotalCount(response.meta.total);
      setCurrentOffset(response.meta.total_pages > 0 ? offset - 1 : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch LGAs for filter
  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        const response = await getLGAs({ limit: 50, page: 1 });
        setLgas(response.data.map((lga) => ({ id: lga.id, name: lga.name })));
      } catch (error) {
        console.error("Failed to fetch LGAs:", error);
      }
    };

    fetchLGAData();
  }, []);

  // Initial load and filter changes
  useEffect(() => {
    setCurrentOffset(0);
    fetchVehicles(0, pageSize);
  }, [pageSize, categoryFilter, statusFilter, lgaFilter, blacklistFilter]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentOffset(0);
      fetchVehicles(0, pageSize);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newOffset: number) => {
    setCurrentOffset(newOffset);
    fetchVehicles(newOffset, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize);
    setPageSize(size);
    setCurrentOffset(0);
    fetchVehicles(0, size);
  };

  const getLGAById = (id: string) => {
    return lgas.find((a) => a.id === id);
  };
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;

    return vehicles.filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      // || (vehicle?.owner &&
      //   `${vehicle?.owner?.firstName} ${vehicle?.owner?.lastName}`
      //     .toLowerCase()
      //     .includes(searchTerm.toLowerCase())) ||
      // (vehicle?.registeredLga &&
      //   vehicle?.registeredLga?.name
      //     .toLowerCase()
      //     .includes(searchTerm.toLowerCase()))
    );
  }, [vehicles, searchTerm]);

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string, checked: boolean) => {
    if (checked) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId));
    }
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredVehicles.map((vehicle) => vehicle.id));
    }
  };

  // Calculate pagination
  const currentPage = Math.floor(currentOffset / pageSize) + 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get vehicle status info
  const getVehicleStatusInfo = (vehicle: Vehicle) => {
    if (vehicle.deletedAt)
      return { label: "Deleted", variant: "destructive" as const };
    if (vehicle.blacklisted)
      return { label: "Blacklisted", variant: "destructive" as const };
    return {
      label: vehicle.status,
    };
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      active: vehicles.filter(
        (v) => v.status === "ACTIVE" && !v.blacklisted && !v.deletedAt
      ).length,
      blacklisted: vehicles.filter((v) => v.blacklisted).length,
      suspended: vehicles.filter((v) => v.status === "SUSPENDED").length,
    };
  }, [vehicles, totalCount]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Manage and view all vehicles registered in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link
            href={"/vehicles/add"}
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex items-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered vehicles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vehicles
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blacklisted}</div>
            <p className="text-xs text-muted-foreground">
              Blacklisted vehicles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">Suspended vehicles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific vehicles or filter by category, status, and LGA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by plate number, color, category, owner, or LGA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VEHICLE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={lgaFilter} onValueChange={setLgaFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LGAs</SelectItem>
                  {lgas.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={blacklistFilter}
                onValueChange={setBlacklistFilter}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Blacklist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Blacklisted</SelectItem>
                  <SelectItem value="false">Not Blacklisted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedVehicles.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedVehicles.length} vehicles selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  Blacklist Selected
                </Button>
                <Button variant="destructive" size="sm">
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles List</CardTitle>
          <CardDescription>
            {searchTerm ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            lgaFilter !== "all" ||
            blacklistFilter !== "all"
              ? `Showing ${filteredVehicles.length} filtered results`
              : `Showing ${filteredVehicles.length} of ${totalCount} vehicles`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No vehicles found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ||
                categoryFilter !== "all" ||
                statusFilter !== "all" ||
                lgaFilter !== "all" ||
                blacklistFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No vehicles have been registered yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedVehicles.length === filteredVehicles.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>LGA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => {
                    const thisLGA = getLGAById(vehicle.registeredLgaId);
                    const statusInfo = getVehicleStatusInfo(vehicle);
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVehicles.includes(vehicle.id)}
                            onCheckedChange={(checked) =>
                              handleVehicleSelect(
                                vehicle.id,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="flex items-center gap-3"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={vehicle.image || "/placeholder.svg"}
                                alt={vehicle.plateNumber}
                              />
                              <AvatarFallback>
                                <Car className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {vehicle.plateNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.category} • {vehicle.color}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          {vehicle?.owner ? (
                            <div>
                              <div className="font-medium">
                                {vehicle?.owner?.firstName}{" "}
                                {vehicle?.owner?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle?.owner?.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              No owner assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {thisLGA?.id ? (
                            <Badge variant="outline">{thisLGA.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                            {vehicle.blacklisted && (
                              <Badge variant="destructive" className="text-xs">
                                Blacklisted
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(String(vehicle.last_payment_date))}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(String(vehicle.createdAt))}
                        </TableCell>
                        <TableCell className="text-right">
                          <VehicleActionButtons
                            vehicle={vehicle}
                            onVehicleUpdate={() =>
                              fetchVehicles(currentOffset, pageSize)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filteredVehicles.length > 0 && totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {currentOffset + 1} to{" "}
                {Math.min(currentOffset + pageSize, totalCount)} of {totalCount}{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentOffset - pageSize)}
                  disabled={currentOffset <= 0}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    const offset = (pageNum - 1) * pageSize;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentOffset === offset ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(offset)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentOffset + pageSize)}
                  disabled={currentOffset + pageSize >= totalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
