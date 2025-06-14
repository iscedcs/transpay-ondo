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
    console.error("Error uploading stickers:", error);
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
    console.error("Error attaching sticker:", error);
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
    console.error("Error fetching sticker:", error);
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
    console.error("Error deleting sticker:", error);
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
    console.error("Error restoring sticker:", error);
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

    const response = await fetch(
      `${API}/api/barcode/all?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch barcodes");
    }

    let filteredStickers = result.data.barcodes;

    // Apply client-side filtering for search and status
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredStickers = filteredStickers.filter((sticker: Sticker) =>
        sticker.code.toLowerCase().includes(searchTerm)
      );
    }

    if (options.status && options.status !== "all") {
      filteredStickers = filteredStickers.filter((sticker: Sticker) => {
        switch (options.status) {
          case "used":
            return sticker.isUsed && sticker.vehicleId;
          case "available":
            return !sticker.isUsed && !sticker.vehicleId && !sticker.deletedAt;
          case "deleted":
            return sticker.deletedAt;
          default:
            return true;
        }
      });
    }

    // Calculate statistics
    const stats: StickerStats = {
      total: result.data.count,
      used: result.data.barcodes.filter((s: Sticker) => s.isUsed && s.vehicleId)
        .length,
      available: result.data.barcodes.filter(
        (s: Sticker) => !s.isUsed && !s.vehicleId && !s.deletedAt
      ).length,
      deleted: result.data.barcodes.filter((s: Sticker) => s.deletedAt).length,
    };

    return {
      success: true,
      data: {
        stickers: filteredStickers,
        stats,
        pagination: {
          total: result.data.count,
          page: options.page || 1,
          limit: result.data.pagination.limit,
          totalPages: Math.ceil(result.data.count / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching stickers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch stickers",
    };
  }
}
