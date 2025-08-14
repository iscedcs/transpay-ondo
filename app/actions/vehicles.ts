"use server";

import { db } from "@/lib/db";
import {
  Prisma,
  TransactionCategories,
  VehicleCategories,
} from "@prisma/client";

interface FetchVehicleParams {
  page?: number;
  pageSize?: number;
}

export type VehicleFilter = {
  status?: "INACTIVE" | "ACTIVE" | "CLEARED" | "OWING";
  category?: VehicleCategories;
  type?: string;
  search?: string;
};

export async function getVehicles(
  page: number = 1,
  pageSize: number = 20,
  filter: VehicleFilter = {}
) {
  const where: Prisma.VehicleWhereInput = {};

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.category) {
    where.category = filter.category;
  }

  if (filter.type) {
    where.type = filter.type;
  }

  if (filter.search) {
    where.OR = [
      { User: { email: { contains: filter.search, mode: "insensitive" } } },
      {
        plateNumber: {
          contains: filter.search,
          mode: "insensitive",
        },
      },
      { vin: { contains: filter.search, mode: "insensitive" } },
      // {
      //      securityCode: {
      //           contains: filter.search,
      //           mode: "insensitive",
      //      },
      // },
    ];
  }

  const [vehicles, totalCount] = await db.$transaction([
    db.vehicle.findMany({
      where,
      select: {
        id: true,
        plateNumber: true,
        color: true,
        category: true,
        type: true,
        status: true,
        createdAt: true,
        User: true,
        securityCode: true,
        vin: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.vehicle.count({ where }),
  ]);

  return {
    vehicles,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
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
  categories: VehicleCategories[]
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
    throw new Error("Failed to get vehicle category data");
  }
};

export const getFullVehicleById = async (id: string) => {
  try {
    const vehicle = await db.vehicle.findFirst({
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
        User: true,
      },
    });
    if (vehicle) {
      return vehicle;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};
