"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  User,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getVehicles, type Vehicle } from "@/actions/vehicles";
import { type LGA, getLGAs } from "@/actions/lga";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { getVehicleCategories, getVehicleTypes } from "@/lib/constants";
import { DatePickerWithRange } from "./ui/date-range-picker";
import { formatVehicleStatus, getStatusColor } from "@/lib/utils";
import { isValid } from "date-fns";

interface SearchVehiclesProps {
  enableAdvancedSearch?: boolean;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  maxResults?: number;
  showResultsCount?: boolean;
}

interface SearchFilters {
  query: string;
  category: string;
  status: string;
  registeredLgaId: string;
  blacklisted: string;
  type: string;
  dateRange: DateRange | undefined;
  hasImage: string;
  hasWallet: string;
  hasTracker: string;
}

export function SearchVehicles({
  enableAdvancedSearch = false,
  onVehicleSelect,
  maxResults = 50,
  showResultsCount = true,
}: SearchVehiclesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lgas, setLGAs] = useState<LGA[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    status: searchParams.get("status") || "",
    registeredLgaId: searchParams.get("lga") || "",
    blacklisted: searchParams.get("blacklisted") || "",
    type: searchParams.get("type") || "",
    dateRange: undefined,
    hasImage: searchParams.get("hasImage") || "",
    hasWallet: searchParams.get("hasWallet") || "",
    hasTracker: searchParams.get("hasTracker") || "",
  });

  const itemsPerPage = 10;

  // Load LGAs for advanced search
  useEffect(() => {
    if (enableAdvancedSearch) {
      loadLGAs();
    }
  }, [enableAdvancedSearch]);

  // Initial search if query params exist
  useEffect(() => {
    if (
      searchParams.get("q") ||
      searchParams.get("category") ||
      searchParams.get("status")
    ) {
      handleSearch();
    }
  }, []);

  const loadLGAs = async () => {
    try {
      const response = await getLGAs();
      setLGAs(response.data);
    } catch (error) {}
  };

  const handleSearch = useCallback(
    async (page = 1) => {
      if (!filters.query.trim() && !hasAdvancedFilters()) {
        toast.error("Please enter a search term or apply filters");
        return;
      }

      setSearchLoading(true);
      setHasSearched(true);

      try {
        const searchParams: any = {
          limit: itemsPerPage,
          page: page, // Changed from offset calculation to page
        };

        // Add filters to search params
        if (filters.category) searchParams.category = filters.category;
        if (filters.status) searchParams.status = filters.status;
        if (filters.registeredLgaId)
          searchParams.registeredLgaId = filters.registeredLgaId;
        if (filters.blacklisted)
          searchParams.blacklisted = filters.blacklisted === "true";

        const response = await getVehicles(searchParams);

        // Check if response and data exist before filtering
        if (!response || !response.data || !response.data) {
          toast.error("Invalid response from server");
          setVehicles([]);
          setTotalCount(0);
          return;
        }

        // Filter results based on query and advanced filters
        let filteredVehicles = response.data;

        if (filters.query.trim()) {
          const query = filters.query.toLowerCase();
          filteredVehicles = filteredVehicles.filter(
            (vehicle: Vehicle) =>
              vehicle.plateNumber.toLowerCase().includes(query) ||
              vehicle.vin?.toLowerCase().includes(query) ||
              vehicle.barcode?.code?.toLowerCase().includes(query) ||
              vehicle.owner?.firstName?.toLowerCase().includes(query) ||
              vehicle.owner?.lastName?.toLowerCase().includes(query) ||
              vehicle.owner?.email?.toLowerCase().includes(query) ||
              vehicle.owner?.phone?.includes(query) ||
              vehicle.registeredLga?.name?.toLowerCase().includes(query)
          );
        }

        // Apply additional advanced filters
        if (filters.type) {
          filteredVehicles = filteredVehicles.filter(
            (vehicle: Vehicle) => vehicle.type === filters.type
          );
        }

        if (filters.hasImage) {
          const hasImage = filters.hasImage === "true";
          filteredVehicles = filteredVehicles.filter((vehicle: Vehicle) =>
            hasImage ? !!vehicle.image : !vehicle.image
          );
        }

        if (filters.hasWallet) {
          const hasWallet = filters.hasWallet === "true";
          filteredVehicles = filteredVehicles.filter((vehicle: Vehicle) =>
            hasWallet ? !!vehicle.wallet : !vehicle.wallet
          );
        }

        if (filters.hasTracker) {
          const hasTracker = filters.hasTracker === "true";
          filteredVehicles = filteredVehicles.filter((vehicle: Vehicle) =>
            hasTracker ? !!vehicle.tracker : !vehicle.tracker
          );
        }

        // Apply date range filter
        if (filters.dateRange?.from) {
          filteredVehicles = filteredVehicles.filter((vehicle: Vehicle) => {
            try {
              const vehicleDate = new Date(vehicle.createdAt);
              // Check if the date is valid
              if (isNaN(vehicleDate.getTime())) {
                return false;
              }

              const fromDate = filters.dateRange!.from!;
              const toDate = filters.dateRange!.to || new Date();

              return vehicleDate >= fromDate && vehicleDate <= toDate;
            } catch (error) {
              return false;
            }
          });
        }

        // Limit results if maxResults is specified
        if (maxResults && filteredVehicles.length > maxResults) {
          filteredVehicles = filteredVehicles.slice(0, maxResults);
        }

        setVehicles(filteredVehicles);
        setTotalCount(filteredVehicles.length);
        setCurrentPage(page);

        // Update URL with search params
        updateURL();
      } catch (error) {
        // More specific error messages
        if (error instanceof Error) {
          if (error.message.includes("fetch")) {
            toast.error("Network error. Please check your connection.");
          } else if (error.message.includes("404")) {
            toast.error("Search service not available.");
          } else {
            toast.error(`Search failed: ${error.message}`);
          }
        } else {
          toast.error("Search failed. Please try again.");
        }

        setVehicles([]);
        setTotalCount(0);
      } finally {
        setSearchLoading(false);
      }
    },
    [filters, maxResults]
  );

  const hasAdvancedFilters = () => {
    return !!(
      filters.category ||
      filters.status ||
      filters.registeredLgaId ||
      filters.blacklisted ||
      filters.type ||
      filters.dateRange ||
      filters.hasImage ||
      filters.hasWallet ||
      filters.hasTracker
    );
  };

  const updateURL = () => {
    // Don't update URL if this is being used as a picker component
    if (onVehicleSelect) {
      return;
    }

    const params = new URLSearchParams();

    if (filters.query) params.set("q", filters.query);
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);
    if (filters.registeredLgaId) params.set("lga", filters.registeredLgaId);
    if (filters.blacklisted) params.set("blacklisted", filters.blacklisted);
    if (filters.type) params.set("type", filters.type);
    if (filters.hasImage) params.set("hasImage", filters.hasImage);
    if (filters.hasWallet) params.set("hasWallet", filters.hasWallet);
    if (filters.hasTracker) params.set("hasTracker", filters.hasTracker);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/search${newURL}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      status: "",
      registeredLgaId: "",
      blacklisted: "",
      type: "",
      dateRange: undefined,
      hasImage: "",
      hasWallet: "",
      hasTracker: "",
    });
    setVehicles([]);
    setTotalCount(0);
    setHasSearched(false);
    setCurrentPage(1);

    // Only update URL if not being used as a picker
    if (!onVehicleSelect) {
      router.replace("/search", { scroll: false });
    }
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    if (onVehicleSelect) {
      // If onVehicleSelect is provided, use it and don't navigate
      onVehicleSelect(vehicle);
    } else {
      // Only navigate if no onVehicleSelect callback is provided
      router.push(`/vehicles/${vehicle.id}`);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.registeredLgaId) count++;
    if (filters.blacklisted) count++;
    if (filters.type) count++;
    if (filters.dateRange) count++;
    if (filters.hasImage) count++;
    if (filters.hasWallet) count++;
    if (filters.hasTracker) count++;
    return count;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Vehicle Search
          </CardTitle>
          <CardDescription>
            Search for vehicles by plate number, VIN, owner information, or
            other criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by plate number, VIN, owner name, email, phone..."
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={searchLoading}
              className="px-6"
            >
              {searchLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Searching...
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Advanced Search Toggle */}
          {enableAdvancedSearch && (
            <div className="flex items-center justify-between">
              <Collapsible
                open={isAdvancedOpen}
                onOpenChange={setIsAdvancedOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Search
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                    {isAdvancedOpen ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Advanced Filters
                      </CardTitle>
                      <CardDescription>
                        Use these filters to narrow down your search results
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Vehicle Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Category
                          </Label>
                          <Select
                            value={filters.category}
                            onValueChange={(value) =>
                              setFilters((prev) => ({
                                ...prev,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">
                                All Categories
                              </SelectItem>
                              {getVehicleCategories().map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.split("_").join(" ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={filters.status}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Statuses</SelectItem>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="SUSPENDED">
                                Suspended
                              </SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={filters.type}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Types</SelectItem>
                              {getVehicleTypes().map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.split("_").join(" ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Location & Administrative Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Registered LGA
                          </Label>
                          <Select
                            value={filters.registeredLgaId}
                            onValueChange={(value) =>
                              setFilters((prev) => ({
                                ...prev,
                                registeredLgaId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select LGA" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All LGAs</SelectItem>
                              {lgas.map((lga) => (
                                <SelectItem key={lga.id} value={lga.id}>
                                  {lga.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Blacklist Status</Label>
                          <Select
                            value={filters.blacklisted}
                            onValueChange={(value) =>
                              setFilters((prev) => ({
                                ...prev,
                                blacklisted: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blacklist status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Vehicles</SelectItem>
                              <SelectItem value="false">
                                Not Blacklisted
                              </SelectItem>
                              <SelectItem value="true">Blacklisted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Registration Date Range
                        </Label>
                        <DatePickerWithRange
                          date={filters.dateRange}
                          onDateChange={(dateRange) =>
                            setFilters((prev) => ({ ...prev, dateRange }))
                          }
                        />
                      </div>

                      <Separator />

                      {/* Feature Filters */}
                      <div className="space-y-4">
                        <Label>Additional Filters</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Has Image</Label>
                            <Select
                              value={filters.hasImage}
                              onValueChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  hasImage: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Any</SelectItem>
                                <SelectItem value="true">Has Image</SelectItem>
                                <SelectItem value="false">No Image</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Has Wallet</Label>
                            <Select
                              value={filters.hasWallet}
                              onValueChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  hasWallet: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Any</SelectItem>
                                <SelectItem value="true">Has Wallet</SelectItem>
                                <SelectItem value="false">No Wallet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Has Tracker</Label>
                            <Select
                              value={filters.hasTracker}
                              onValueChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  hasTracker: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Any</SelectItem>
                                <SelectItem value="true">
                                  Has Tracker
                                </SelectItem>
                                <SelectItem value="false">
                                  No Tracker
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleSearch()}
                          disabled={searchLoading}
                        >
                          Apply Filters
                        </Button>
                        <Button variant="outline" onClick={clearFilters}>
                          <X className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {(hasSearched || hasAdvancedFilters()) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                {showResultsCount && (
                  <CardDescription>
                    {searchLoading
                      ? "Searching..."
                      : `Found ${totalCount} vehicle${
                          totalCount !== 1 ? "s" : ""
                        }`}
                  </CardDescription>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage <= 1 || searchLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={currentPage >= totalPages || searchLoading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={vehicle.image || undefined}
                          alt={vehicle.plateNumber}
                        />
                        <AvatarFallback>
                          <Car className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      {vehicle.blacklisted && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {vehicle.plateNumber}
                        </h3>
                        <Badge variant={getStatusColor(vehicle.status)}>
                          {formatVehicleStatus(vehicle.status)}
                        </Badge>
                        {vehicle.blacklisted && (
                          <Badge variant="destructive">Blacklisted</Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {vehicle.category.split("_").join(" ")}
                          </span>
                          {vehicle.registeredLga && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {vehicle.registeredLga.name}
                            </span>
                          )}
                        </div>

                        {vehicle.owner && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {vehicle.owner.firstName} {vehicle.owner.lastName}
                            {vehicle.owner.phone && (
                              <span className="ml-2">
                                • {vehicle.owner.phone}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs">
                          <span>Color: {vehicle.color}</span>
                          {vehicle.vin && <span>VIN: {vehicle.vin}</span>}
                          <span>
                            Registered:{" "}
                            {(() => {
                              const date = new Date(vehicle.createdAt);
                              return isValid(date)
                                ? format(date, "MMM dd, yyyy")
                                : "Invalid Date";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No vehicles found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
