"use server";

import { auth } from "@/auth";
import { API, URLS } from "@/lib/const";
import { revalidatePath } from "next/cache";
import type { GeoJSONPolygon, NigerianLGABoundary } from "@/types/lga";
import { z } from "zod";

export interface LGAResponse {
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  data: LGA[];
}

export interface LGA {
  id: string;
  name: string;
  fee: string;
  boundary: GeoJSONPolygon | NigerianLGABoundary;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface VehicleFee {
  vehicleCategory: string;
  fee: number;
}

const GetLGAsSchema = z.object({
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1),
});

type GetLGAsParams = z.infer<typeof GetLGAsSchema>;

const GetLGAScansSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

type GetLGAScansParams = z.infer<typeof GetLGAScansSchema>;

export interface LGAUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email: string;
  role: string;
  gender: string | null;
  marital_status: string | null;
  whatsapp: string | null;
  nok_name: string | null;
  nok_phone: string | null;
  nok_relationship: string | null;
  maiden_name: string | null;
  blacklisted: boolean;
  address: string | null;
  identification: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  createdBy: string | null;
  lgaId: string;
  status: string;
}

export interface LGAVehicle {
  id: string;
  plateNumber: string;
  category: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
  createdAt: string;
  wallet: {
    lastTransactionDate: string;
    walletBalance: string;
  };
}

export interface LGAScan {
  user: {
    firstName: string;
    lastName: string;
  };
  vehicle: {
    plateNumber: string;
    category: string;
  };
  longitude: number;
  latitude: number;
  createdAt: string;
  declaredRouteHit: boolean;
  detectedLga: {
    name: string;
  };
  id: string;
}

export interface LGAScansResponse {
  success: boolean;
  message: string;
  data: LGAScan[];
  meta: {
    page: number;
    limit: number;
    count: number;
    totalPages: number;
  };
}

export interface LGAVehiclesResponse {
  success: boolean;
  message: string;
  data: LGAVehicle[];
  meta: {
    page: number;
    limit: number;
    count: number;
  };
}

export interface LGAUsersResponse {
  success: boolean;
  message: string;
  data: LGAUser[];
  meta: {
    page: number;
    limit: number;
    count: number;
    totalPages: number;
  };
}

export interface LGARoute {
  vehicle: {
    id: string;
    plateNumber: string;
    category: string;
  };
  route: Array<{
    order: number;
    lga: {
      name: string;
      id: string;
    };
  }>;
}

export interface LGARoutesResponse {
  success: boolean;
  message: string;
  data: LGARoute[];
  meta: {
    page: number;
    limit: number;
    count: number;
  };
}

// Schema for validating LGA users parameters
const GetLGAUsersSchema = z.object({
  role: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

type GetLGAUsersParams = z.infer<typeof GetLGAUsersSchema>;

const GetLGAVehiclesSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

type GetLGAVehiclesParams = z.infer<typeof GetLGAVehiclesSchema>;

const GetLGARoutesSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

type GetLGARoutesParams = z.infer<typeof GetLGARoutesSchema>;

export async function getLGAs(
  params: GetLGAsParams = { limit: 50, page: 1 }
): Promise<LGAResponse> {
  try {
    const { limit, page } = GetLGAsSchema.parse(params);

    const url = new URL(`${API}/api/lga/all`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      headers: {
        accept: "*/*",
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch LGAs: ${response.status} ${response.statusText}`
      );
    }

    const data: LGAResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch LGAs"
    );
  }
}

export async function getLGAById(id: string): Promise<LGA> {
  try {
    const response = await fetch(`${API}/api/lga/one/${id}`, {
      headers: {
        accept: "*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch LGA: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch LGA");
    }

    // Parse the fee string into an array of objects if it's a string
    const lga = data.data;
    return {
      ...lga,
      fee: lga.fee,
    };
  } catch (error) {
    console.error("Error fetching LGA by ID:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch LGA"
    );
  }
}

export async function getLGAUsers(
  id: string,
  params: GetLGAUsersParams = { page: 1, limit: 10 }
): Promise<LGAUsersResponse> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      console.log("No session or user found");
      return {
        success: false,
        message: "No session or user found",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }
    const token = session?.user.access_token;
    if (!token) {
      console.log("No access token found in the session");
      return {
        success: false,
        message: "No access token found in the session",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }
    // Validate input parameters
    const { role, page, limit } = GetLGAUsersSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}${URLS.lga.users.replace("{id}", id)}`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    // Add role filter if provided
    if (role) {
      url.searchParams.append("role", role);
    }

    // Fetch data from the API
    const response = await fetch(url.toString(), {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("LGA not found or no users found");
        return {
          success: false,
          message: "LGA not found or no users found",
          data: [],
          meta: {
            page: 1,
            limit: 10,
            count: 0,
            totalPages: 0,
          },
        };
      }
      console.log(
        `Failed to fetch LGA users: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        message: `Failed to fetch LGA users: ${response.status} ${response.statusText}`,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }

    const data: LGAUsersResponse = await response.json();

    if (!data.success) {
      console.log(data.message || "Failed to fetch LGA users");
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching LGA users:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch LGA users",
      data: [],
      meta: {
        page: 1,
        limit: 10,
        count: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getLGAVehicles(
  id: string,
  params: GetLGAVehiclesParams = { page: 1, limit: 10 }
): Promise<LGAVehiclesResponse> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      console.log("No session or user found");
      return {
        success: false,
        message: "No session or user found",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }
    const token = session?.user.access_token;
    if (!token) {
      console.log("No access token found in the session");
      return {
        success: false,
        message: "No access token found in the session",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }
    // Validate input parameters
    const { page, limit } = GetLGAVehiclesSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}${URLS.lga.vehicles.replace("{id}", id)}`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    // Fetch data from the API
    const response = await fetch(url.toString(), {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("LGA not found or no vehicles found");
        return {
          success: false,
          message: "LGA not found or no vehicles found",
          data: [],
          meta: {
            page: 1,
            limit: 10,
            count: 0,
          },
        };
      }
      console.log(
        `Failed to fetch LGA vehicles: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        message: `Failed to fetch LGA vehicles: ${response.status} ${response.statusText}`,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }

    const data: LGAVehiclesResponse = await response.json();

    if (!data.success) {
      console.log(data.message || "Failed to fetch LGA vehicles");
      return {
        success: false,
        message: data.message || "Failed to fetch LGA vehicles",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching LGA vehicles:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch LGA vehicles",
      data: [],
      meta: {
        page: 1,
        limit: 10,
        count: 0,
      },
    };
  }
}

export async function getLGAScans(
  id: string,
  params: GetLGAScansParams = { page: 1, limit: 10 }
): Promise<LGAScansResponse> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      console.log("No session or user found");
      return {
        success: false,
        message: "No session or user found",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }
    const token = session?.user.access_token;
    if (!token) {
      console.log("No access token found in the session");
      return {
        success: false,
        message: "No access token found in the session",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }
    // Validate input parameters
    const { page, limit } = GetLGAScansSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}${URLS.lga.scans.replace("{id}", id)}`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    // Fetch data from the API
    const response = await fetch(url.toString(), {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch LGA scans: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }

    const data: LGAScansResponse = await response.json();

    if (!data.success) {
      const errorMessage = data.message || "Failed to fetch LGA scans";
      console.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
          totalPages: 0,
        },
      };
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch LGA scans";
    console.error("Error fetching LGA scans:", error);
    return {
      success: false,
      message: errorMessage,
      data: [],
      meta: {
        page: 1,
        limit: 10,
        count: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getLGARoutes(
  id: string,
  params: GetLGARoutesParams = { page: 1, limit: 10 }
): Promise<LGARoutesResponse> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      console.log("No session or user found");
      return {
        success: false,
        message: "No session or user found",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }
    const token = session?.user.access_token;
    if (!token) {
      console.log("No access token found in the session");
      return {
        success: false,
        message: "No access token found in the session",
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }
    // Validate input parameters
    const { page, limit } = GetLGARoutesSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}/api/lga/routes/${id}`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    // Fetch data from the API
    const response = await fetch(url.toString(), {
      headers: {
        accept: "*/*",
        // Add authorization header if you have access to the token
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch LGA routes: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }

    const data: LGARoutesResponse = await response.json();

    if (!data.success) {
      const errorMessage = data.message || "Failed to fetch LGA routes";
      console.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          count: 0,
        },
      };
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch LGA routes";
    console.error("Error fetching LGA routes:", error);
    return {
      success: false,
      message: errorMessage,
      data: [],
      meta: {
        page: 1,
        limit: 10,
        count: 0,
      },
    };
  }
}

export async function createLGAsBulk(
  lgas: {
    name: string;
    fee: VehicleFee[];
    boundary: {
      type: string;
      coordinates: number[][][];
    };
  }[]
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${API}/api/lga/create-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(lgas),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create LGAs: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating LGAs in bulk:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create LGAs"
    );
  }
}

export async function softDeleteLGA(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API}/api/lga/soft/${id}`, {
      method: "PATCH",
      headers: {
        accept: "*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("LGA not found or already deleted");
      }
      throw new Error(
        `Failed to soft delete LGA: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "LGA soft deleted successfully",
    };
  } catch (error) {
    console.error("Error soft deleting LGA:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to soft delete LGA"
    );
  }
}

export async function hardDeleteLGA(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API}/api/lga/hard/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("LGA not found");
      }
      throw new Error(
        `Failed to permanently delete LGA: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "LGA permanently deleted",
    };
  } catch (error) {
    console.error("Error permanently deleting LGA:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to permanently delete LGA"
    );
  }
}

export async function createLga(
  name: string,
  fee: string,
  boundary: GeoJSONPolygon
) {
  const session = await auth();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };

  const payload = {
    name: name,
    fee: fee,
    boundary: boundary,
  };

  try {
    const response = await fetch(`${API}${URLS.lga}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create lga");
    }

    const data = await response.json();

    // Revalidate the page where this data is used
    revalidatePath(`/lgas`);

    return { success: true, data };
  } catch (error) {
    console.error("Error creating lga:", error);
    return { success: false, error: "Failed to create lga" };
  }
}

export async function updateLGA(
  id: string,
  data: {
    name: string;
    fee: VehicleFee[];
    boundary: {
      type: string;
      coordinates: number[][][];
    };
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  const session = await auth();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  try {
    const response = await fetch(`${API}/api/lga/update/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("LGA not found");
      }
      throw new Error(
        `Failed to update LGA: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || "LGA updated successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Error updating LGA:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update LGA"
    );
  }
}

export async function updateLGAFee(
  id: string,
  vehicleCategory: string,
  newFee: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const session = await auth();
    const headers = {
      "Content-Type": "application/json",
      "api-secret": process.env.API_SECRET || "",
      Authorization: `Bearer ${session?.user.access_token}`,
    };
    const response = await fetch(`${API}/api/lga/update/fee/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        vehicleCategory,
        newFee,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("LGA not found");
      }
      throw new Error(
        `Failed to update LGA fee: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || "Fee updated successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("Error updating LGA fee:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update LGA fee"
    );
  }
}
