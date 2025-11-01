"use client";

import { AssignRouteModal } from "@/components/routes/assign-route-modal";
import { DeleteConfirmationModal } from "@/components/routes/delete-confirmation-modal";
import { LGARouteSummaryCard } from "@/components/routes/lga-route-summary-card";
import { PageHeader } from "@/components/routes/page-header";
import { VehicleRouteTable } from "@/components/routes/vehicle-route-table";
import { VehicleRouteViewDrawer } from "@/components/routes/vehicle-route-view-drawer";
import { STATE_CONFIG } from "@/lib/constants";
import {
  createVehicleRoute,
  deleteVehicleRoute,
  getRoutesForLGA,
  getVehicleRoutes,
} from "@/lib/routes-data";
import type {
  CreateRouteData,
  RouteFilters,
  VehicleRoute,
} from "@/types/routes";
import { useEffect, useState } from "react";

import { getMe } from "@/actions/users";
import { Role, User } from "@prisma/client";
import { toast } from "sonner";

export default function RoutesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [routes, setRoutes] = useState<VehicleRoute[]>([]);
  const [lgaRoutes, setLGARoutes] = useState<VehicleRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RouteFilters>({});
  const [selectedRoute, setSelectedRoute] = useState<VehicleRoute | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user: any = (await getMe()).user;

        // Check access permissions
        if (
          ![
            Role.SUPERADMIN,
            Role.ADMIN,
            Role.AGENCY_ADMIN,
            Role.AGENCY_AGENT,
          ].includes(user.role)
        ) {
          window.location.href = "/dashboard?error=unauthorized";
          return;
        }

        setCurrentUser(user);

        // Set default filters based on role
        if (user.role === "ADMIN" && user.lgaId) {
          setFilters({ stateId: "1" }); // Admin locked to their state
        } else if (
          (user.role === "AGENCY_ADMIN" || user.role === "AGENCY_AGENT") &&
          user.lgaId
        ) {
          setFilters({ lgaId: user.lgaId }); // LGA users locked to their LGA
        }

        await loadRoutes();
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load routes page",
        });
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  const loadRoutes = async () => {
    try {
      const result = await getVehicleRoutes(filters);
      setRoutes(result.routes);

      // Load LGA-specific routes for LGA Admin/Agent
      if (
        currentUser &&
        (currentUser.role === "AGENCY_ADMIN" ||
          currentUser.role === "AGENCY_AGENT") &&
        currentUser.lgaId
      ) {
        const lgaRoutesData = await getRoutesForLGA(currentUser.lgaId);
        setLGARoutes(lgaRoutesData);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load routes",
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadRoutes();
    }
  }, [filters, currentUser]);

  const handleCreateRoute = async (data: CreateRouteData) => {
    try {
      await createVehicleRoute(data);
      await loadRoutes();
      toast.success("Success", {
        description: "Vehicle route created successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to create route",
      });
      throw error;
    }
  };

  const handleViewRoute = (route: VehicleRoute) => {
    setSelectedRoute(route);
    setShowViewDrawer(true);
  };

  const handleEditRoute = (route: VehicleRoute) => {
    setSelectedRoute(route);
    // TODO: Implement edit modal
    toast.success("Coming Soon", {
      description: "Edit functionality will be implemented next",
    });
  };

  const handleDeleteRoute = (route: VehicleRoute) => {
    setSelectedRoute(route);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (routeId: string, hardDelete: boolean) => {
    try {
      await deleteVehicleRoute(routeId, hardDelete);
      await loadRoutes();
      toast.success("Success", {
        description: `Route ${
          hardDelete ? "permanently deleted" : "soft deleted"
        } successfully`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete route",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading routes...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const isLGAUser =
    currentUser.role === "AGENCY_ADMIN" || currentUser.role === "AGENCY_AGENT";
  const lgaName = isLGAUser
    ? STATE_CONFIG.lgas.find((lga) => lga.id === currentUser.lgaId)?.name
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        <PageHeader
          userRole={currentUser.role}
          userLgaId={currentUser.lgaId}
          filters={filters}
          onFiltersChange={setFilters}
          onAssignRoute={() => setShowAssignModal(true)}
        />

        {/* LGA-specific view for LGA Admin/Agent */}
        {isLGAUser && lgaName && (
          <LGARouteSummaryCard
            routes={lgaRoutes}
            lgaId={currentUser.lgaId!}
            lgaName={lgaName}
            onViewRoute={handleViewRoute}
          />
        )}

        {/* Main routes table */}
        <VehicleRouteTable
          routes={routes}
          userRole={currentUser.role}
          userLgaId={currentUser.lgaId}
          onViewRoute={handleViewRoute}
          onEditRoute={handleEditRoute}
          onDeleteRoute={handleDeleteRoute}
        />

        {routes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isLGAUser
                ? "No routes pass through your LGA."
                : "No routes found matching your criteria."}
            </p>
          </div>
        )}

        {/* Role-based access information */}
        {isLGAUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">ℹ️</div>
              <div>
                <h4 className="font-medium text-blue-900">
                  {currentUser.role === "AGENCY_ADMIN"
                    ? "LGA Admin"
                    : "LGA Agent"}{" "}
                  Access Scope
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {currentUser.role === "AGENCY_ADMIN"
                    ? `You can view and edit routes that pass through ${lgaName}. You cannot delete routes or assign new ones.`
                    : `You can view routes that pass through ${lgaName}. You cannot edit, delete, or assign routes.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <AssignRouteModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleCreateRoute}
      />

      <VehicleRouteViewDrawer
        route={selectedRoute}
        isOpen={showViewDrawer}
        onClose={() => setShowViewDrawer(false)}
      />

      <DeleteConfirmationModal
        route={selectedRoute}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
