"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Car,
  Shield,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
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
import { toast } from "sonner";
import { getVehicles, getVehicleStats, type Vehicle } from "@/actions/vehicles";
import { getLGAs } from "@/actions/lga";
import {
  cn,
  formatRoleName,
  formatVehicleStatus,
  getStatusColor,
} from "@/lib/utils";
import { getVehicleCategories } from "@/lib/constants";
import { VehicleActionButtons } from "@/app/(root)/vehicles/vehicle-action-buttons";
import Link from "next/link";

export function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blacklisted: 0,
    suspended: 0,
    pending: 0,
    deleted: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Get search params with defaults
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchTerm = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const lgaFilter = searchParams.get("lga") || "all";
  const blacklistedFilter = searchParams.get("blacklisted") || "all";
  const limit = Number(searchParams.get("limit")) || 10;

  // Meta data from API
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  // Fetch LGAs for filter
  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        const response = await getLGAs({ limit: 100, page: 1 });
        setLgas(response.data.map((lga) => ({ id: lga.id, name: lga.name })));
      } catch (error) {
        // TODO: Handle error fetching LGAs
      }
    };

    fetchLGAData();
  }, []);

  // Fetch vehicle stats using server action
  const fetchVehicleStats = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setStatsLoading(true);
      }

      const response = await getVehicleStats();
      setStats(response.data);

      if (showRefreshToast) {
        toast.success("Vehicle stats refreshed successfully");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vehicle stats";
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch vehicles using server action
  const fetchVehicles = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build parameters for server action
      const params: any = {
        limit,
        page: currentPage,
      };

      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (lgaFilter !== "all") params.registeredLgaId = lgaFilter;
      if (blacklistedFilter !== "all")
        params.blacklisted = blacklistedFilter === "true";

      const response = await getVehicles(params);
      setVehicles(response.data);
      setMeta({
        total: response.data.count,
        totalPages: Math.ceil(response.data.count / limit),
        currentPage: currentPage,
      });

      if (showRefreshToast) {
        toast.success("Vehicles data refreshed successfully");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vehicles";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when search params change
  useEffect(() => {
    fetchVehicles();
  }, [
    currentPage,
    categoryFilter,
    statusFilter,
    lgaFilter,
    blacklistedFilter,
    limit,
  ]);

  // Initial stats load
  useEffect(() => {
    fetchVehicleStats();
  }, []);

  // Update URL with search params
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change (except when changing page itself)
    if (
      !updates.page &&
      (updates.search !== undefined ||
        updates.category !== undefined ||
        updates.status !== undefined ||
        updates.lga !== undefined ||
        updates.blacklisted !== undefined ||
        updates.limit !== undefined)
    ) {
      params.delete("page");
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/vehicles${newUrl}`, { scroll: false });
  };

  // Handle search input with debouncing
  const [searchInput, setSearchInput] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        updateSearchParams({ search: searchInput || null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filter vehicles based on search term (client-side filtering)
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;

    return vehicles.filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.owner &&
          `${vehicle.owner.firstName} ${vehicle.owner.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (vehicle.registeredLga &&
          vehicle.registeredLga.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get vehicle status info
  const getVehicleStatusInfo = (vehicle: Vehicle) => {
    if (vehicle.deletedAt)
      return { label: "Deleted", variant: "destructive" as const };
    if (vehicle.blacklisted)
      return { label: "Blacklisted", variant: "destructive" as const };
    return {
      label: formatVehicleStatus(vehicle.status),
      variant: getStatusColor(vehicle.status),
    };
  };

  return (
    <div className="p-4 space-y-4 md:py-8 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and view all vehicles registered in the system
          </p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchVehicles(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link
            href={"/vehicles/add"}
            className={cn(
              buttonVariants({ size: "sm" }),
              "flex items-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-16 md:w-20" />
            ) : (
              <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">All registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Active Vehicles
            </CardTitle>
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-16 md:w-20" />
            ) : (
              <div className="text-lg md:text-2xl font-bold">
                {stats.active}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Blacklisted
            </CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-16 md:w-20" />
            ) : (
              <div className="text-lg md:text-2xl font-bold">
                {stats.blacklisted}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Blacklisted vehicles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Suspended
            </CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 md:h-8 w-16 md:w-20" />
            ) : (
              <div className="text-lg md:text-2xl font-bold">
                {stats.suspended}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Suspended vehicles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription className="text-sm">
            Find specific vehicles or filter by category, status, and LGA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by plate number, color, category, owner, or LGA..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  updateSearchParams({ category: value })
                }
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getVehicleCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatRoleName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => updateSearchParams({ status: value })}
              >
                <SelectTrigger className="w-full md:w-32">
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
              <Select
                value={lgaFilter}
                onValueChange={(value) => updateSearchParams({ lga: value })}
              >
                <SelectTrigger className="w-full md:w-48">
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
                value={blacklistedFilter}
                onValueChange={(value) =>
                  updateSearchParams({ blacklisted: value })
                }
              >
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Blacklist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Blacklisted</SelectItem>
                  <SelectItem value="false">Not Blacklisted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={limit.toString()}
                onValueChange={(value) => updateSearchParams({ limit: value })}
              >
                <SelectTrigger className="w-full md:w-32">
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
            <div className="flex flex-col space-y-2 p-3 bg-blue-50 rounded-lg md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <span className="text-sm font-medium">
                {selectedVehicles.length} vehicles selected
              </span>
              <div className="flex flex-wrap gap-2">
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
          <CardTitle className="text-lg md:text-xl">Vehicles List</CardTitle>
          <CardDescription>
            {searchTerm ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            lgaFilter !== "all" ||
            blacklistedFilter !== "all"
              ? `Showing ${filteredVehicles.length} filtered results`
              : `Showing ${filteredVehicles.length} of ${meta.total} vehicles`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px] md:w-[250px]" />
                    <Skeleton className="h-4 w-[150px] md:w-[200px]" />
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
                blacklistedFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No vehicles have been registered yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {filteredVehicles.map((vehicle) => {
                  const statusInfo = getVehicleStatusInfo(vehicle);
                  return (
                    <Card key={vehicle.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={(checked) =>
                            handleVehicleSelect(vehicle.id, checked as boolean)
                          }
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={vehicle.image || "/placeholder.svg"}
                            alt={vehicle.plateNumber}
                          />
                          <AvatarFallback>
                            <Car className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {vehicle.plateNumber}
                            </h3>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div>
                              {formatRoleName(vehicle.category)} •{" "}
                              {vehicle.color}
                            </div>

                            {vehicle.owner && (
                              <div>
                                <strong>Owner:</strong>{" "}
                                {vehicle.owner.firstName}{" "}
                                {vehicle.owner.lastName}
                              </div>
                            )}

                            {vehicle.registeredLga ? (
                              <div>
                                <strong>LGA:</strong>{" "}
                                {vehicle.registeredLga.name}
                              </div>
                            ) : (
                              <div className="text-orange-600">
                                No LGA assigned
                              </div>
                            )}

                            <div>
                              <strong>Last Payment:</strong>{" "}
                              {formatDate(vehicle.last_payment_date)}
                            </div>
                          </div>

                          <div className="mt-3">
                            <VehicleActionButtons
                              vehicle={vehicle}
                              onVehicleUpdate={() => fetchVehicles()}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
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
                            <div className="flex items-center gap-3">
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
                                  {formatRoleName(vehicle.category)} •{" "}
                                  {vehicle.color}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.owner ? (
                              <div>
                                <div className="font-medium">
                                  {vehicle.owner.firstName}{" "}
                                  {vehicle.owner.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {vehicle.owner.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No owner assigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.registeredLga ? (
                              <Badge variant="outline">
                                {vehicle.registeredLga.name}
                              </Badge>
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
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Blacklisted
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(vehicle.last_payment_date)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(vehicle.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <VehicleActionButtons
                              vehicle={vehicle}
                              onVehicleUpdate={() => fetchVehicles()}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filteredVehicles.length > 0 && meta.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="text-sm text-muted-foreground text-center md:text-left">
                Showing page {meta.currentPage} of {meta.totalPages} (
                {meta.total} total vehicles)
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSearchParams({ page: (currentPage - 1).toString() })
                  }
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>

                {/* Page numbers - show fewer on mobile */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, meta.totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      if (meta.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= meta.totalPages - 2) {
                        pageNum = meta.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            updateSearchParams({ page: pageNum.toString() })
                          }
                          className="w-8 h-8 p-0 hidden md:inline-flex"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}

                  {/* Mobile: just show current page */}
                  <div className="md:hidden text-sm text-muted-foreground">
                    {currentPage} / {meta.totalPages}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSearchParams({ page: (currentPage + 1).toString() })
                  }
                  disabled={currentPage >= meta.totalPages}
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
