"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, RefreshCw, ShieldX, Car } from "lucide-react";
import { toast } from "sonner";
import {
  getExemptedVehicles,
  removeVehicleExemption,
} from "@/actions/vehicle-settings";

interface ExemptedVehicle {
  id: string;
  vehicleId: string;
  plateNumber?: string;
  model?: string;
  make?: string;
  exemptionType: string;
  createdAt: string;
}

interface ExemptedVehiclesTableProps {
  refreshTrigger: number;
}

export function ExemptedVehiclesTable({
  refreshTrigger,
}: ExemptedVehiclesTableProps) {
  const [vehicles, setVehicles] = useState<ExemptedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchExemptedVehicles = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const result = await getExemptedVehicles(page, 10);
      if (result.success && result.data) {
        setVehicles(result.data.rows);
        setTotalPages(result.data.meta.total_pages);
        setTotal(result.data.meta.total);
        setCurrentPage(page);
      } else {
        toast.error(result.error || "Failed to fetch exempted vehicles");
        setVehicles([]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch exempted vehicles"
      );
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExemption = async (vehicleId: string) => {
    startTransition(async () => {
      try {
        const result = await removeVehicleExemption(vehicleId);
        if (result.success) {
          toast.success("Vehicle exemption removed successfully");
          fetchExemptedVehicles(currentPage, searchTerm);
        } else {
          toast.error(result.error || "Failed to remove exemption");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove exemption"
        );
      }
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchExemptedVehicles(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchExemptedVehicles(page, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.plateNumber &&
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchExemptedVehicles();
  }, [refreshTrigger]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Exempted Vehicles ({total})
            </CardTitle>
            <CardDescription>
              Vehicles currently exempted from CVOF payments
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchExemptedVehicles(currentPage, searchTerm)}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle ID or plate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Vehicle Info</TableHead>
                <TableHead>Exemption Type</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading exempted vehicles...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No vehicles found matching your search"
                      : "No exempted vehicles found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.plateNumber || "N/A"}</TableCell>
                    <TableCell>
                      {vehicle.make && vehicle.model
                        ? `${vehicle.make} ${vehicle.model}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.exemptionType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(vehicle.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExemption(vehicle.id)}
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                      >
                        <ShieldX className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({total} total vehicles)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
