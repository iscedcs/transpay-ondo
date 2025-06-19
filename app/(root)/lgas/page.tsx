"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
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
import { LGA, VehicleFee, getLGAs } from "@/actions/lga";
import { LGAImportModal } from "@/components/lgas/lga-import-modal";
import Link from "next/link";
import { DeleteLGADialog } from "./delete-lga-dailogue";
import { LGABoundariesMap } from "./lga-boundaries-map";
import CONFIG from "@/config";
import { formatFees } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function AllLGAsPage() {
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteDialogLGA, setDeleteDialogLGA] = useState<LGA | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const session = useSession();

  // Fetch LGAs data
  const fetchLGAs = async (
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLGAs({ page, limit });
      setLgas(response.data);
      setTotalPages(response.meta.pages);
      setTotalCount(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch LGAs");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLGAs(1, pageSize);
  }, [pageSize]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        // Filter locally for now - you could implement server-side search
        const filtered = lgas.filter((lga) =>
          lga.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // For demo purposes, we're filtering client-side
        // In production, you'd want to implement server-side search
      } else {
        fetchLGAs(1, pageSize);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLGAs(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    fetchLGAs(1, size);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter LGAs based on search term
  const filteredLGAs = searchTerm
    ? lgas.filter((lga) =>
        lga.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : lgas;

  const handleDeleteLGA = (lga: LGA) => {
    setDeleteDialogLGA(lga);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setDeleteDialogLGA(null);
    fetchLGAs(currentPage, pageSize); // Refresh the current page
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Local Government Areas
          </h1>
          <p className="text-muted-foreground">
            Manage and view all LGAs in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
          {["ADMIN", "SUPERADMIN"].includes(String(session.data?.user.role)) ? (
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Import LGAs
            </Button>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total LGAs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all {CONFIG.stateName}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPage} of {totalPages}
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filteredLGAs.length} LGAs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Size</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageSize}</div>
            <p className="text-xs text-muted-foreground">Items per page</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Visualization */}
      {showMap && (
        <Card>
          <CardHeader>
            <CardTitle>LGA Boundaries Map</CardTitle>
            <CardDescription>
              Interactive map showing all LGA boundaries. Click on any boundary
              to view details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LGABoundariesMap lgas={lgas} loading={loading} />
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific LGAs or adjust display settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search LGAs by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* LGAs Table */}
      <Card>
        <CardHeader>
          <CardTitle>LGAs List</CardTitle>
          <CardDescription>
            {searchTerm
              ? `Showing ${filteredLGAs.length} results for "${searchTerm}"`
              : `Showing ${filteredLGAs.length} of ${totalCount} LGAs`}
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
          ) : filteredLGAs.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No LGAs found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by importing some LGAs."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setIsImportModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Import LGAs
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vehicle Fees</TableHead>
                    <TableHead>Boundary Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLGAs.map((lga) => (
                    <TableRow key={lga.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/lgas/${lga.id}`}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {lga.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <Badge variant="outline" className="text-xs">
                            {JSON.parse(lga.fee).length} categories
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {formatFees(JSON.parse(lga.fee) as VehicleFee[])}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lga.boundary.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lga.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lga.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/lgas/${lga.id}`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/lgas/${lga.id}/edit`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLGA(lga)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filteredLGAs.length > 0 && !searchTerm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
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
                        onClick={() => handlePageChange(pageNum)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Modal */}
      <LGAImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchLGAs(1, pageSize); // Refresh the list
        }}
      />

      {/* Delete Dialog */}
      <DeleteLGADialog
        lga={deleteDialogLGA}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteDialogLGA(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
