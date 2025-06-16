"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, Eye, Edit, Trash2, Users } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatRoleName, parseAddress } from "@/lib/utils";
import Link from "next/link";
import { USER_ROLES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";
import { User } from "@/actions/users";

interface UsersContentProps {
  initialUsers: User[];
  initialTotalCount: number;
  initialError: string | null;
  searchParams: {
    search: string;
    role: string;
    status: string;
    page: number;
    limit: number;
    offset: number;
  };
}

export function UsersContent({
  initialUsers,
  initialTotalCount,
  initialError,
  searchParams: initialSearchParams,
}: UsersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [searchTerm, setSearchTerm] = useState(initialSearchParams.search);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update URL when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearchParams.search) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page

      startTransition(() => {
        router.push(`/users?${params.toString()}`);
      });
    }
  }, [debouncedSearchTerm, initialSearchParams.search, router, searchParams]);

  // Handle filter changes
  const handleRoleFilterChange = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role === "all") {
      params.delete("role");
    } else {
      params.set("role", role);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", newPageSize);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());

    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
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

  // Format address for display
  const formatAddress = (addressString: string | null) => {
    const address = parseAddress(addressString);
    if (!address) return "No address";
    return `${address.text ?? ""} ${address.city ?? ""} ${address.state ?? ""}`;
  };

  // Filter users based on search term and status (client-side filtering for current page)
  const filteredUsers = useMemo(() => {
    let filtered = initialUsers;

    // Apply status filter (client-side for current page)
    if (initialSearchParams.status !== "all") {
      if (initialSearchParams.status === "active") {
        filtered = filtered.filter(
          (user) => !user.deletedAt && !user.blacklisted
        );
      } else if (initialSearchParams.status === "blacklisted") {
        filtered = filtered.filter((user) => user.blacklisted);
      } else if (initialSearchParams.status === "deleted") {
        filtered = filtered.filter((user) => user.deletedAt);
      }
    }

    return filtered;
  }, [initialUsers, initialSearchParams.status]);

  // Handle user selection
  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // Calculate pagination
  const currentPage = initialSearchParams.page;
  const totalPages = Math.ceil(initialTotalCount / initialSearchParams.limit);

  // Get user status
  const getUserStatus = (user: User) => {
    if (user.deletedAt)
      return { label: "Deleted", variant: "destructive" as const };
    if (user.blacklisted)
      return { label: "Blacklisted", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific users or filter by role and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={initialSearchParams.role}
                onValueChange={handleRoleFilterChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.keys(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={initialSearchParams.status}
                onValueChange={handleStatusFilterChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={initialSearchParams.limit.toString()}
                onValueChange={handlePageSizeChange}
                disabled={isPending}
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
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="destructive" size="sm">
                  Bulk Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {initialError && (
        <Alert variant="destructive">
          <AlertDescription>{initialError}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {initialTotalCount} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <TableRow
                        key={user.id}
                        className={isPending ? "opacity-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) =>
                              handleUserSelect(user.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/users/${user.id}`}
                            className="flex flex-col"
                          >
                            <span className="font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.email}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatRoleName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{user.phone}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {formatAddress(user.address)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/users/${user.id}`}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" })
                              )}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/users/${user.id}/edit`}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" })
                              )}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
      {filteredUsers.length > 0 && totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {initialSearchParams.offset + 1} to{" "}
                {Math.min(
                  initialSearchParams.offset + initialSearchParams.limit,
                  initialTotalCount
                )}{" "}
                of {initialTotalCount} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isPending}
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
                        disabled={isPending}
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
                  disabled={currentPage >= totalPages || isPending}
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
