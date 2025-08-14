"use server";

import { auth } from "@/auth";
import { API } from "@/lib/const";
import { revalidatePath } from "next/cache";

export interface Sticker {
  id: string;
  code: string;
  vehicleId: string | null;
  isUsed: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  vehicle?: {
    id: string;
    plateNumber: string;
    owner?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface StickerStats {
  total: number;
  used: number;
  available: number;
  deleted: number;
}

export interface UploadResult {
  message: string;
  data: {
    total: number;
    inserted: number;
    duplicatesCount: number;
    duplicates: string[];
    errors: number;
  };
}

export async function uploadStickers(formData: FormData) {
  const session = await auth();
  const token = session?.user.access_token;
  try {
    const response = await fetch(`${API}/api/barcode/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: UploadResult = await response.json();
    revalidatePath("/stickers");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload stickers",
    };
  }
}

export async function attachStickerToVehicle(code: string, vehicleId: string) {
  const session = await auth();
  const token = session?.user.access_token;
  try {
    const response = await fetch(`${API}/api/barcode/attach-vehicle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code, vehicleId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    revalidatePath("/stickers");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to attach sticker",
    };
  }
}

export async function getStickerByCode(code: string) {
  const session = await auth();
  const token = session?.user.access_token;
  try {
    const response = await fetch(`${API}/api/barcode/fetch-by-code/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sticker",
    };
  }
}

export async function deleteSticker(id: string) {
  const session = await auth();
  const token = session?.user.access_token;
  try {
    const response = await fetch(`${API}/api/barcode/delete/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/stickers");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete sticker",
    };
  }
}

export async function restoreSticker(id: string) {
  const session = await auth();
  const token = session?.user.access_token;
  try {
    const response = await fetch(`${API}/api/barcode/restore/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/stickers");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to restore sticker",
    };
  }
}

export async function getAllStickers(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "used" | "available" | "deleted";
  } = {}
) {
  try {
    const session = await auth();
    const token = session?.user.access_token;
    const limit = options.limit || 10;
    const offset = ((options.page || 1) - 1) * limit;

    // Build URL with query parameters
    const url = new URL(`${API}/api/barcode/all`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());

    // Add search parameter if provided
    if (options.search && options.search.trim()) {
      url.searchParams.append("search", options.search.trim());
    }

    // Add status filter if provided and not "all"
    if (options.status && options.status !== "all") {
      url.searchParams.append("status", options.status);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch barcodes");
    }

    // Extract data from the new API response structure
    const {
      barcodes,
      totalCount,
      usedCount,
      availableCount,
      deletedCount,
      pagination,
    } = result.data;

    // Calculate statistics from the API response
    const stats: StickerStats = {
      total: totalCount,
      used: usedCount,
      available: availableCount,
      deleted: deletedCount,
    };

    // Calculate total pages based on total count and limit
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        stickers: barcodes,
        stats,
        pagination: {
          total: totalCount,
          page: options.page || 1,
          limit: pagination.limit,
          totalPages,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch stickers",
    };
  }
}