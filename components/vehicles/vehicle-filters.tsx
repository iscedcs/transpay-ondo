"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { STATE_CONFIG } from "@/lib/constants";
import type { VehicleFilters } from "@/types/vehicles";
import { ADMIN_ROLES } from "@/lib/const";

interface VehicleFiltersComponentProps {
  filters: VehicleFilters;
  onFiltersChange: (filters: VehicleFilters) => void;
  userRole: string;
  userStateId?: string;
  userLgaId?: string;
}

export function VehicleFiltersComponent({
  filters,
  onFiltersChange,
  userRole,
  userStateId,
  userLgaId,
}: VehicleFiltersComponentProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (
    key: keyof VehicleFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters };
    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      // @ts-expect-error: expect error
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const baseFilters: VehicleFilters = {};

    // Maintain role-based filters
    if (userRole === "ADMIN" && userStateId) {
      // @ts-expect-error: expect error
      baseFilters.stateId = userStateId;
    } else if (
      ["LGA_ADMIN", "LGA_AGENT", "LGA_C_AGENT"].includes(userRole) &&
      userLgaId
    ) {
      baseFilters.lgaId = userLgaId;
    }

    setSearchTerm("");
    onFiltersChange(baseFilters);
  };

  const getActiveFilterCount = () => {
    const filterKeys = Object.keys(filters).filter((key) => {
      // Don't count role-based filters
      if (key === "stateId" && userRole === "admin") return false;
      if (
        key === "lgaId" &&
        ["lga_admin", "lga_agent", "lga_compliance"].includes(userRole)
      )
        return false;
      if (key === "ownerId" && userRole === "vehicle_owner") return false;
      return filters[key as keyof VehicleFilters] !== undefined;
    });
    return filterKeys.length;
  };

  const canFilterByState = ADMIN_ROLES.includes(userRole);
  const canFilterByLGA = ADMIN_ROLES.includes(userRole);
  const canFilterByOwner = ADMIN_ROLES.includes(userRole);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">{getActiveFilterCount()}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by plate number, owner name, or VIN..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">
                Pending Verification
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="government">Government</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.complianceStatus || "all"}
            onValueChange={(value) =>
              handleFilterChange("complianceStatus", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Compliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Compliance</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              <SelectItem value="grace_period">Grace Period</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              filters.blacklisted
                ? "true"
                : filters.blacklisted === false
                ? "false"
                : "all"
            }
            onValueChange={(value) =>
              handleFilterChange(
                "blacklisted",
                value === "all" ? undefined : value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Blacklist Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="false">Not Blacklisted</SelectItem>
              <SelectItem value="true">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {canFilterByState && (
              <Select
                // @ts-expect-error: expect
                value={filters.stateId || "all"}
                // @ts-expect-error: expect
                onValueChange={(value) => handleFilterChange("stateId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="1">{STATE_CONFIG.name}</SelectItem>
                </SelectContent>
              </Select>
            )}

            {canFilterByLGA && (
              <Select
                value={filters.lgaId || "all"}
                onValueChange={(value) => handleFilterChange("lgaId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LGAs</SelectItem>
                  {STATE_CONFIG.lgas.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              // @ts-expect-error: expect
              value={filters.type || "all"}
              // @ts-expect-error: expect
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="taxi">Taxi</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="MOTOR_CYCLE">MOTOR_CYCLE</SelectItem>
                <SelectItem value="tricycle">Tricycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                // @ts-expect-error: expect
                filters.hasQRCode
                  ? "true"
                  : // @ts-expect-error: expect
                  filters.hasQRCode === false
                  ? "false"
                  : "all"
              }
              onValueChange={(value) =>
                handleFilterChange(
                  // @ts-expect-error: expect
                  "hasQRCode",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="QR Code Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="true">Has QR Code</SelectItem>
                <SelectItem value="false">No QR Code</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Registration year..."
              // @ts-expect-error: expect
              value={filters.registrationYear || ""}
              // onChange={(e) =>
              //   handleFilterChange("registrationYear", e.target.value)
              // }
            />

            <Input
              placeholder="Color..."
              // @ts-expect-error: expect
              value={filters.color || ""}
              // @ts-expect-error: expect
              onChange={(e) => handleFilterChange("color", e.target.value)}
            />
          </div>
        )}

        {/* Role-based filter indicators */}
        {userRole === "admin" && userStateId && (
          <div className="text-xs text-muted-foreground">
            Showing vehicles in {STATE_CONFIG.name} only (your assigned state)
          </div>
        )}

        {["lga_admin", "lga_agent", "lga_compliance"].includes(userRole) &&
          userLgaId && (
            <div className="text-xs text-muted-foreground">
              Showing vehicles in{" "}
              {STATE_CONFIG.lgas.find((lga) => lga.id === userLgaId)?.name} only
              (your assigned LGA)
            </div>
          )}

        {userRole === "vehicle_owner" && (
          <div className="text-xs text-muted-foreground">
            Showing only your registered vehicles
          </div>
        )}
      </CardContent>
    </Card>
  );
}
