'use server'

import { revalidatePath } from "next/cache";
import { PrismaClient, StickerRequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch a single sticker request by ID
export async function getStickerRequest(id: string) {
  try {
    const request = await prisma.stickerRequest.findUnique({
      where: { id },
    });
    return { success: true, data: request };
  } catch (error) {
    return { success: false, error: "Failed to fetch sticker request" };
  }
}

// Fetch all sticker requests with optional filtering
export async function getAllStickerRequests(filters?: {
  status?: StickerRequestStatus;
  vehicleId?: string;
}) {
  try {
    const requests = await prisma.stickerRequest.findMany({
      where: {
        ...filters,
        deletedAt: null,
      },
      include: {
        Vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: "Failed to fetch sticker requests" };
  }
}

// Soft delete a sticker request
export async function deleteStickerRequest(id: string) {
  try {
    const deletedRequest = await prisma.stickerRequest.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    revalidatePath("/sticker-requests");
    return { success: true, data: deletedRequest };
  } catch (error) {
    return { success: false, error: "Failed to delete sticker request" };
  }
}

// Approve a sticker request
export async function approveStickerRequest(id: string) {
  try {
    const approvedRequest = await prisma.stickerRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath("/sticker-requests");
    return { success: true, data: approvedRequest };
  } catch (error) {
    return { success: false, error: "Failed to approve sticker request" };
  }
}

