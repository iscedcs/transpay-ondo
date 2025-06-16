"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { API, URLS } from "@/lib/const";
import { db } from "@/lib/db";
import { $Enums, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types for the User dat

export interface Address {
  country?: string;
  text?: string;
  lga?: string;
  city?: string;
  state?: string;
  unit?: string;
  postal_code?: string;
}

export interface User {
  id: string; // UUID format
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // Adjust roles as necessary
  blacklisted: boolean;
  address: string; // JSON string format
  identification: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  deletedAt: string | null; // ISO 8601 date string or null
  lastLogin: string | null; // ISO 8601 date string or null
  lgaId: string; // UUID format
  lga: {
    id: string; // UUID format
    name: string;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    deletedAt: string | null; // ISO 8601 date string or null
  };
  gender: string | null;
  whatsapp: string | null;
  createdBy: string | null;
  maiden_name: string | null;
  marital_status: string | null;
  nok_name: string | null;
  nok_phone: string | null;
  nok_relationship: string | null;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    count: number;
    pagination: {
      limit: number;
      offset: number;
    };
  };
}

// Schema for validating input parameters
const GetUsersSchema = z.object({
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  role: z.nativeEnum(Role).optional(),
});

type GetUsersParams = z.infer<typeof GetUsersSchema>;

/**
 * Server action to fetch paginated list of users
 * @param params - Query parameters (limit, offset, role)
 * @returns Promise with users response data
 */
export async function getUsers(
  params: GetUsersParams = { limit: 10, offset: 0 }
): Promise<UsersResponse> {
  try {
    // Validate input parameters
    const { limit, offset, role } = GetUsersSchema.parse(params);

    // Build the URL with query parameters
    const url = new URL(`${API}/api/user`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());
    if (role) {
      url.searchParams.append("role", role);
    }
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
        `Failed to fetch users: ${response.status} ${response.statusText}`
      );
    }

    const data: UsersResponse = await response.json();

    // Parse address strings into objects if they exist
    const processedData = {
      ...data,
      data: {
        ...data.data,
        users: data.data.users.map((user) => ({
          ...user,
          address: user.address,
        })),
      },
    };

    return processedData;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch users"
    );
  }
}

export async function getUserById(id: string): Promise<User> {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized access: No session found");
  }
  const token = session?.user.access_token;
  if (!token) {
    throw new Error("Unauthorized access: No token found");
  }
  try {
    const response = await fetch(`${API}/api/user/${id}`, {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found");
      }
      throw new Error(
        `Failed to fetch user: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch user"
    );
  }
}

export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<User> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized access: No session found");
    }
    const token = session?.user.access_token;
    if (!token) {
      throw new Error("Unauthorized access: No token found");
    }

    const response = await fetch(`${API}/api/user/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to update user: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update user");
    }

    // Revalidate the users pages to reflect the changes
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return data.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update user"
    );
  }
}

// Pagination parameters: page, pageSize, and filtering by role
interface AllUsersFetchParams {
  page?: number;
  pageSize?: number;
  role?: $Enums.Role; // Optional role filter
}

interface AllAgentsCreatedByAdminIdFetchParams {
  page?: number;
  pageSize?: number;
  adminId: string;
}

export const allUsers = async ({
  page = 1,
  pageSize = 10,
  role,
}: AllUsersFetchParams) => {
  const session = await auth();
  if (!session || !session.user) {
    return undefined;
  }
  if (session.user.role !== $Enums.Role.SUPERADMIN)
    try {
      // Calculate the offset for pagination
      const skip = (page - 1) * pageSize;

      // Build the query object dynamically based on whether role is provided
      const query = {
        skip,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          deletedAt: true,
          phone: true,
          email: true,
          role: true,
          blacklisted: true,
          address: true,
          identification: true,
        },
        where: {}, // Default empty filter
      };

      // Add role filter to the query if a role is provided
      if (role) {
        query.where = { role };
      }

      // Fetch users with the optional role filter and pagination
      const users = await db.user.findMany(query);

      // Fetch the total number of users with the same role (or all users if no role filter)
      const totalUsers = await db.user.count({
        where: role ? { role } : {},
      });

      return {
        success: {
          message: "OKAY",
          data: users,
          totalUsers, // Total count of users with the current filter
          currentPage: page,
          totalPages: Math.ceil(totalUsers / pageSize), // Calculate total pages for front-end
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { error: "Something went wrong!!!" };
    }
};

export const allAgentsCreatedByAdminId = async ({
  page = 1,
  pageSize = 10,
  adminId,
}: AllAgentsCreatedByAdminIdFetchParams) => {
  try {
    // Calculate the offset for pagination
    const skip = (page - 1) * pageSize;

    // Build the query object dynamically based on whether role is provided
    const query = {
      skip,
      take: pageSize,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        firstName: true,
        phone: true,
        email: true,
        role: true,
        blacklisted: true,
        address: true,
        identification: true,
      },
      where: {}, // Default empty filter
    };

    // Fetch users with the optional role filter and pagination
    const users = await db.user.findMany(query);

    // Fetch the total number of users with the same role (or all users if no role filter)
    const totalUsers = await db.user.count({
      where: {
        role: "ADMIN",
      },
    });

    return {
      success: {
        message: "OKAY",
        data: users,
        totalUsers, // Total count of users with the current filter
        currentPage: page,
        totalPages: Math.ceil(totalUsers / pageSize), // Calculate total pages for front-end
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Something went wrong!!!" };
  }
};

export const getMe = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return {
      error: "Unauthorized",
    };
  }
  const token = session?.user.access_token;
  if (!token) {
    return { error: "Unauthorized" };
  }
  const URL = `${API}${URLS.user.me}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  try {
    const res = await fetch(URL, { headers, cache: "no-store" });
    if (!res.ok) {
      return { error: "Failed to fetch user data" };
    }
    const data = await res.json();
    const user = data.data;
    if (!user) {
      return { error: "User not found" };
    }
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { error: "Something went wrong while fetching user data" };
  }
};

export async function createUser(userData: Partial<any>): Promise<User> {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized access: No session found");
  }
  // if (session.user.role !== "SUPERADMIN") {
  //   throw new Error("Unauthorized access: Only SUPERADMIN can create users");
  // }
  const token = session?.user.access_token;
  if (!token) {
    throw new Error("Unauthorized access: No token found");
  }
  try {
    const response = await fetch(`${API}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to create user: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create user");
    }

    // Revalidate the users page to reflect the new user
    revalidatePath("/users");

    return data.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create user"
    );
  }
}