"use server";

import { db } from "@/lib/db";
import { TransactionCategories } from "@prisma/client";
import { z } from "zod";
import { API } from "@/lib/const";
import { auth } from "@/auth";
import { CreateVehicleRequest } from "@/app/(root)/vehicles/vehicle-form-validation";
import { revalidatePath } from "next/cache";
import { VehicleOwner } from "@/types/vehicles";

interface FetchVehicleParams {
  page?: number;
  pageSize?: number;
}

export interface VehicleWallet {
  id: string;
  vehicleId: string;
  walletBalance: string;
  amountOwed: string;
  netTotal: string;
  lastTransactionDate: string;
  nextTransactionDate: string;
  cvofBalance: string;
  fareflexBalance: string;
  isceBalance: string;
  cvofOwing: string;
  fareflexOwing: string;
  isceOwing: string;
  accountNumber: string | null;
  bankCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  accounts: WalletAccount[];
}

export interface WalletAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  bankCode: string;
  accountType: "INBOUND" | "OUTBOUND"; // expand if needed
  email: string;
  phone: string;
  creationDate: string;
  bankName: string;
  active: boolean;
  walletId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Barcodes {
  id: string;
  code: string;
  vehicleId: string | null;
  isUsed: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Vehicle {
  id: string;
  color: string;
  category: string;
  plateNumber: string;
  image: string | null;
  blacklisted: boolean;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  type: string;
  vin: string | null;
  barcode?: Barcodes;
  fairFlexImei: string | null;
  ownerId: string;
  stateCode: string;
  vCode: string | null;
  securityCode: string | null;
  startDate: string | null;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  registeredLgaId: string;
  last_payment_date: string | null;
  // Populated fields
  owner?: VehicleOwner;
  registeredLga?: {
    id: string;
    name: string;
  };
  wallet?: VehicleWallet;
  tracker?: {
    id: string;
    vehicleId: string;
    trackerId: string;
    status: string;
    lastLocation?: string;
    lastUpdate?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  transactions?: any[];
}

export type VehicleFilter = {
  status?: "INACTIVE" | "ACTIVE" | "CLEARED" | "OWING";
  // category?: TransactionCategories;
  category?: TransactionCategories;
  type?: string;
  search?: string;
};

export interface SingleVehicleResponse {
  success: boolean;
  message: string;
  data: {
    data: Vehicle;
  };
}

const GetVehiclesSchema = z.object({
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  registeredLgaId: z.string().optional(),
  ownerId: z.string().optional(),
  blacklisted: z.boolean().optional(),
});

type GetVehiclesParams = z.infer<typeof GetVehiclesSchema>;

// Vehicle stats response interface
export interface VehicleStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    active: number;
    blacklisted: number;
    suspended: number;
    pending: number;
    deleted: number;
  };
}

export async function getVehicleStats(): Promise<VehicleStatsResponse> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized access: No session found");
    }
    const token = session?.user.access_token;
    if (!token) {
      throw new Error("Unauthorized access: No token found");
    }
    // Fetch data from the API
    const response = await fetch(`${API}/api/vehicles/stats`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure we get fresh data
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch vehicle stats: ${response.status} ${response.statusText}`
      );
    }

    const data: VehicleStatsResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch vehicle stats");
    }

    return data;
  } catch (error) {
    console.log("Error fetching vehicle stats:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch vehicle stats"
    );
  }
}

export async function updateVehicle(
  id: string,
  vehicleData: Partial<Vehicle>
): Promise<
  { success: true; data: Vehicle } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access: No session found" };
    }

    const token = session?.user.access_token;
    if (!token) {
      return { success: false, error: "Unauthorized access: No token found" };
    }
    const response = await fetch(`${API}/api/vehicles/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error:
          errorData.message ||
          `Failed to update vehicle: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || "Failed to update vehicle",
      };
    }

    // Revalidate the vehicles pages to reflect the changes
    revalidatePath("/vehicles");
    revalidatePath(`/vehicles/${id}`);

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update vehicle",
    };
  }
}

export async function getVehicles(
  params: GetVehiclesParams = { limit: 10, offset: 0 }
): Promise<any> {
  try {
    // Validate input parameters
    const {
      limit,
      offset,
      category,
      status,
      registeredLgaId,
      ownerId,
      blacklisted,
    } = GetVehiclesSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}/api/vehicles`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());

    if (category) url.searchParams.append("category", category);
    if (status) url.searchParams.append("status", status);
    if (registeredLgaId)
      url.searchParams.append("registeredLgaId", registeredLgaId);
    if (ownerId) url.searchParams.append("ownerId", ownerId);
    if (blacklisted !== undefined)
      url.searchParams.append("blacklisted", blacklisted.toString());

    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized access: No session found");
    }
    const token = session?.user.access_token;
    if (!token) {
      throw new Error("Unauthorized access: No token found");
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
      throw new Error(
        `Failed to fetch vehicles: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching vehicles:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch vehicles"
    );
  }
}

export async function createVehicleWithOwner(
  vehicleData: CreateVehicleRequest
): Promise<
  { success: true; data: Vehicle } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access: No session found" };
    }

    const token = session?.user.access_token;
    if (!token) {
      return { success: false, error: "Unauthorized access: No token found" };
    }

    const response = await fetch(`${API}/api/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errorData.message ||
          `Failed to create vehicle: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || "Failed to create vehicle",
      };
    }

    // Revalidate the vehicles page to reflect the new vehicle
    revalidatePath("/vehicles");

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create vehicle",
    };
  }
}

export async function createVehicleVirtualAccount(walletData: {
  walletId: string;
  bvn: string;
  dob: string;
}): Promise<any> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized access: No session found");
    }
    const token = session?.user.access_token;
    if (!token) {
      throw new Error("Unauthorized access: No token found");
    }
    const response = await fetch(`${API}/api/vehicles/create-virtual-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to create virtual account: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create virtual account");
    }

    return data.data;
  } catch (error) {
    console.log("Error creating virtual account:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create virtual account"
    );
  }
}

export async function getVehicleById(
  id: string
): Promise<
  { success: true; data: Vehicle } | { success: false; error: string }
> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    const response = await fetch(`${API}/api/vehicles/${id}`, {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Vehicle not found" };
      }
      return {
        success: false,
        error: `Failed to fetch vehicle: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return {
        success: false,
        error: data.message || "Failed to fetch vehicle",
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.log("Error fetching vehicle by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch vehicle",
    };
  }
}

export async function getVehicleByBarcode(barcode: string): Promise<Vehicle> {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    const response = await fetch(`${API}/api/vehicles/barcode/${barcode}`, {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch vehicle");
    }

    return data.data;
  } catch (error) {
    console.log("Error fetching vehicle by ID:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch vehicle"
    );
  }
}

export async function vehicleWithStickerCount() {
  const vehicle = await db.vehicle.count({
    where: {
      NOT: [
        {
          BarCodes: null,
        },
      ],
    },
  });
  return vehicle ?? 0;
}

export const allVehicles = async ({
  page = 1,
  pageSize = 20,
}: FetchVehicleParams) => {
  try {
    // Calculate the offset for pagination
    const skip = (page - 1) * pageSize;

    const query = {
      skip,
      take: pageSize,
      // select: {
      //      id: true,
      //      createdAt: true,
      //      updatedAt: true,
      //      deletedAt: true,
      // },
      where: {}, // Default empty filter
      orderBy: {
        createdAt: "desc",
      },
    };

    const vehicles = await db.vehicle.findMany({
      ...query,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch the total number of vehicles with the same role (or all vehicles if no role filter)
    const totalVehicles = await db.vehicle.count();

    return {
      success: {
        message: "OKAY",
        data: vehicles,
        totalVehicles, // Total count of vehicles with the current filter
        currentPage: page,
        totalPages: Math.ceil(totalVehicles / pageSize), // Calculate total pages for front-end
      },
    };
  } catch (error) {
    console.log("Error fetching vehicles:", error);
    return { error: "Something went wrong!!!" };
  }
};

export const allVehiclesCount = async () => {
  try {
    const vehiclesCount = await db.vehicle.count();

    return {
      success: {
        message: "OKAY",
        data: vehiclesCount,
      },
    };
  } catch {
    return { error: "Something went wrong!!!" };
  }
};

export const allVehiclesRegisteredByAgentId = async (userId: string) => {
  try {
    const vehiclesCount = await db.auditTrail.findMany({
      where: {
        name: "VEHICLE_UPDATED",
        meta: {
          path: ["user", "id"],
          equals: userId,
        },
      },
    });

    // Use a Set to store unique plate numbers
    const uniquePlateNumbers = new Set<string>();

    vehiclesCount.forEach((vehicle) => {
      // Assuming the plate number is always in the format "Vehicle <plateNumber> information was updated successfully"
      const regex = /Vehicle\s(\w+)\sinformation/; // This regex captures the plate number
      const match = vehicle.description.match(regex);

      if (match) {
        const plateNumber = match[1]; // Get the plate number from the regex match
        uniquePlateNumbers.add(plateNumber); // Add to the set for unique entries
      }
    });

    // Return the count of unique plate numbers
    return {
      success: {
        message: "OKAY",
        data: {
          vehicles: uniquePlateNumbers,
          count: uniquePlateNumbers.size,
        }, // Return the count of unique plate numbers
      },
    };
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong!!!" };
  }
};

export const allVehiclesByAgentId = async (userId: string) => {
  try {
    const vehiclesCount = await db.auditTrail.findMany({
      where: {
        name: "VEHICLE_UPDATED",
        meta: {
          path: ["user", "id"],
          equals: userId,
        },
      },
    });

    // Use a Map to store unique vehicles with plate number as the key
    const uniqueVehicles = new Map<string, any>();

    vehiclesCount.forEach((vehicle) => {
      // Assuming the plate number is always in the format "Vehicle <plateNumber> information was updated successfully"
      const regex = /Vehicle\s(\w+)\sinformation/; // This regex captures the plate number
      const match = vehicle.description.match(regex);

      if (match) {
        const plateNumber = match[1]; // Get the plate number from the regex match
        // Add the vehicle object to the Map using the plate number as a key
        uniqueVehicles.set(plateNumber, vehicle);
      }
    });

    // Convert Map values (unique vehicle objects) to an array
    const uniqueVehiclesArray = Array.from(uniqueVehicles.values());

    // Return the array of unique vehicles and their count
    return {
      success: {
        message: "OKAY",
        data: {
          vehicles: uniqueVehiclesArray,
          count: uniqueVehiclesArray.length,
        }, // Return the array of unique vehicles and their count
      },
    };
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong!!!" };
  }
};

export const getVehicleBySticker = async (barcode: string) => {
  try {
    const vehicle = await db.vehicle.findFirst({
      where: {
        BarCodes: {
          code: barcode,
        },
      },
    });
    if (vehicle) {
      return {
        success: {
          message: "OKAY",
          data: {
            vehicle,
          },
        },
      };
    } else {
      return undefined;
    }
  } catch (error) {
    return {
      error: `Could not fetch vehicle with barcode ${barcode}`,
    };
  }
};
export const getVehicleByFareFlexImei = async (fairFlexImei: string) => {
  try {
    const vehicle = await db.vehicle.findFirst({
      where: {
        fairFlexImei,
      },
    });
    if (vehicle) {
      return {
        success: {
          message: "OKAY",
          data: {
            vehicle,
          },
        },
      };
    } else {
      return undefined;
    }
  } catch (error) {
    return {
      error: `Could not fetch vehicle with barcode ${fairFlexImei}`,
    };
  }
};
export const getVehicleCategoriesData = async (
  categories: TransactionCategories[]
) => {
  try {
    // Query the database to count vehicles in each category
    const vehicles = await db.vehicle.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
      where: {
        category: {
          in: categories,
        },
      },
    });

    // Structure the result
    const categoryCounts = categories.reduce((acc, category) => {
      const categoryData = vehicles.find((v) => v.category === category);
      acc[category] = categoryData ? categoryData._count.category : 0;
      return acc;
    }, {} as Record<TransactionCategories, number>);

    // Return the counts for the predefined categories
    return categoryCounts;
  } catch (error) {
    console.log("Error fetching vehicle data: ", error);
    throw new Error("Failed to get vehicle category data");
  }
};
export const getVehicleCategoriesCounts = async () => {
  try {
    // Query the database to count vehicles grouped by category
    const vehicles = await db.vehicle.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
    });

    // Query the database to get the total count of vehicles
    const totalVehicles = await db.vehicle.count();

    // Structure the result by mapping the counts of each category
    const categoryCounts = vehicles.reduce(
      (acc, vehicle) => {
        acc[vehicle.category || "OTHERS"] = vehicle._count.category;
        return acc;
      },
      {} as Record<string, number> // Use 'string' since categories may be dynamic
    );

    // Return the counts for all categories found in the database
    return {
      totalVehicles, // Total count of all vehicles
      categories: categoryCounts, // Count of vehicles per category
    };
  } catch (error) {
    console.log("Error fetching vehicle data: ", error);
    throw new Error("Failed to get vehicle category data");
  }
};

export const getFullVehicleById = async (id: string) => {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: {
        id,
      },
      select: {
        vin: true,
        AuditTrail: true,
        BarCodes: true,
        blacklisted: true,
        category: true,
        color: true,
        _count: true,
        createdAt: true,
        deletedAt: true,
        Driver: true,
        fairFlexImei: true,
        image: true,
        LivePaymentNotification: true,
        User: true,
        PaymentNotification: true,
        plateNumber: true,
        securityCode: true,
        type: true,
        updatedAt: true,
        VehicleFine: true,
        VehicleTracker: true,
        VehicleTransaction: true,
        VehicleWaiver: true,
        VehicleWallet: true,
        status: true,
        id: true,
        groupId: true,
        VehicleGroup: true,
        last_payment_date: true,
        stateCode: true,
        vCode: true,
        registeredLgaId: true,
        LGA: true,
        startDate: true,
        ownerId: true,
        Scan: true,
        StickerPaymentNotification: true,
        StickerRequest: true,
        VehicleImage: true,
        VehicleRoute: true,
        WaiverRequest: true,
      },
    });
    if (vehicle) {
      return {
        vehicle,
      };
    } else {
      return undefined;
    }
  } catch (error) {
    return {
      error: `Could not fetch vehicle with id ${id}`,
    };
  }
};

export const getVehicleIdByPlate = async (plateNumber: string) => {
     try {
          const vehicle = await db.vehicle.findFirst({
               where: {
                    plateNumber,
               },
               select: {
                    id: true,
                    User: true
               },
          });
          if (vehicle) {
               return vehicle
          } else {
               return undefined;
          }
     } catch (error) {
          return undefined;
     }
}