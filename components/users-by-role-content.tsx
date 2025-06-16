"use client";

import { useState, useMemo } from "react";
import { type User, getUsers } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { formatRoleName } from "@/lib/utils";

interface UsersByRoleContentProps {
  role: Role;
  initialUsers: User[];
  totalCount: number;
  currentPage: number;
  limit: number;
  initialSearch?: string;
  initialStatus?: string;
}

export function UsersByRoleContent({
  role,
  initialUsers,
  totalCount,
  currentPage,
  limit,
  initialSearch = "",
  initialStatus = "all",
}: UsersByRoleContentProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update URL when filters change
  const updateURL = (newSearch: string, newStatus: string, page = 1) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newStatus && newStatus !== "all") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    router.push(`/users/${role.toLowerCase()}?${params.toString()}`);
  };

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone.includes(searchTerm)
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter((user) => {
        switch (status) {
          case "active":
            return !user.blacklisted && !user.deletedAt;
          case "blacklisted":
            return user.blacklisted;
          case "inactive":
            return user.deletedAt;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [users, search, status]);

  const handleSearch = (value: string) => {
    setSearch(value);
    updateURL(value, status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateURL(search, value);
  };

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        role,
        limit,
        offset: (currentPage - 1) * limit,
      });

      if (response.success) {
        setUsers(response.data.users);
      } else {
        toast.error("Error", {
          description: "Failed to refresh users",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to refresh users",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserStatusBadge = (user: User) => {
    if (user.deletedAt) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (user.blacklisted) {
      return <Badge variant="destructive">Blacklisted</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${formatRoleName(role).toLowerCase()}...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blacklisted">Blacklisted</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={refreshUsers} disabled={loading} variant="outline">
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredUsers.length} of {totalCount}{" "}
          {formatRoleName(role).toLowerCase()}
          {search && ` matching "${search}"`}
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {search
                        ? `No ${formatRoleName(
                            role
                          ).toLowerCase()} found matching "${search}"`
                        : `No ${formatRoleName(role).toLowerCase()} found`}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.iran.liara.run/public/job/doctor/${
                              user?.gender?.toLowerCase() || "male"
                            }`}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.phone}</div>
                        {user.whatsapp && (
                          <div className="text-xs text-muted-foreground">
                            WhatsApp: {user.whatsapp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getUserStatusBadge(user)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? format(new Date(user.lastLogin), "MMM dd, yyyy")
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                          {user.blacklisted ? (
                            <DropdownMenuItem>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unblacklist
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <UserX className="h-4 w-4 mr-2" />
                              Blacklist
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateURL(search, status, currentPage - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateURL(search, status, page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateURL(search, status, currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
