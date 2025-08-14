"use server";

import { auth } from "@/auth";
import { API } from "@/lib/const";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// TypeScript interfaces
export interface VehicleRoute {
  id: string;
  vehicleId: string;
  lgaId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lga: {
    name: string;
  };
  vehicle: {
    plateNumber: string;
    category: string;
  };
}

export interface VehicleRoutesResponse {
  success: boolean;
  message: string;
  data: VehicleRoute[];
  count: number;
}

export interface CreateRouteResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    vehicleId: string;
    lgaId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface ReorderRoutesResponse {
  success: boolean;
  message: string;
}

// Validation schemas
const CreateRouteSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  lgaId: z.string().min(1, "LGA ID is required"),
  order: z.number().min(1, "Order must be at least 1"),
});

const ReorderRouteSchema = z.object({
  routeId: z.string().min(1, "Route ID is required"),
  order: z.number().min(1, "Order must be at least 1"),
});

const ReorderRoutesSchema = z.object({
  routes: z.array(ReorderRouteSchema).min(1, "At least one route is required"),
});

// Server Actions
export async function createVehicleRoute(data: {
  vehicleId: string;
  lgaId: string;
  order: number;
}): Promise<CreateRouteResponse> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    if (!token) {
      return {
        success: false,
        message: "User is not authenticated",
        data: {} as any,
      };
    }
    // Validate input
    const validatedData = CreateRouteSchema.parse(data);

    const response = await fetch(`${API}/api/routes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to create route: ${response.statusText}`,
        data: {} as any,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to create route",
        data: {} as any,
      };
    }

    // Revalidate the vehicle page to show updated routes
    revalidatePath(`/vehicles/${data.vehicleId}`);

    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create route",
      data: {} as any,
    };
  }
}

export async function getVehicleRoutes(
  vehicleId: string
): Promise<VehicleRoutesResponse> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    if (!token) {
      return {
        success: false,
        message: "User is not authenticated",
        data: {} as any,
        count: 0,
      };
    }

    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle ID is required",
        data: [],
        count: 0,
      };
    }

    const response = await fetch(`${API}/api/routes/vehicle/${vehicleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch routes: ${response.statusText}`,
        data: [],
        count: 0,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to fetch routes",
        data: [],
        count: 0,
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data || [],
      count: result.count || 0,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch routes",
      data: [],
      count: 0,
    };
  }
}

export async function reorderVehicleRoutes(
  routes: Array<{
    routeId: string;
    order: number;
  }>
): Promise<ReorderRoutesResponse> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    if (!token) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }
    // Validate input
    const validatedData = ReorderRoutesSchema.parse({ routes });

    const response = await fetch(`${API}/api/routes/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to reorder routes: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to reorder routes",
      };
    }

    // Revalidate to show updated order
    revalidatePath("/vehicles");

    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reorder routes",
    };
  }
}

export async function deleteVehicleRoute(
  routeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!routeId) {
      return {
        success: false,
        message: "Route ID is required",
      };
    }
    const session = await auth();
    const token = session?.user.access_token;
    if (!token) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    // Note: You'll need to add a delete endpoint to your API
    // For now, this is a placeholder implementation
    const response = await fetch(`${API}/api/routes/${routeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to delete route: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to delete route",
      };
    }

    // Revalidate to show updated routes
    revalidatePath("/vehicles");

    return result;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete route",
    };
  }
}
