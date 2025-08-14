'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type StickerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface StickerRequestParams {
  plateNumber?: string
  asin?: string
  status?: StickerRequestStatus
  includeDeleted?: boolean
}

export async function getAllStickerPayments({
  plateNumber,
  asin,
  status,
  includeDeleted = false,
}: StickerRequestParams) {
  try {
    const stickerPayments = await prisma.stickerRequest.findMany({
      where: {
        ...(plateNumber && { plateNumber }),
        ...(asin && { asin }),
        ...(status && { status }),
        ...(!includeDeleted && { deletedAt: null }),
      },
    });
    return stickerPayments;
  } catch (error) {
    throw new Error("Failed to fetch all sticker payments");
  } finally {
    await prisma.$disconnect();
  }
}

export async function getDeletedStickerRequestsByPlateNumber(
  plateNumber: string
) {
  try {
    const deletedRequests = await prisma.stickerRequest.findMany({
      where: {
        plateNumber,
        deletedAt: { not: null },
      },
    });
    return deletedRequests;
  } catch (error) {
    throw new Error("Failed to fetch deleted sticker requests by plate number");
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCountNotDeletedByPlateNumber(plateNumber: string) {
  try {
    const count = await prisma.stickerRequest.count({
      where: {
        plateNumber,
        deletedAt: null,
        status: {
          notIn: ["PENDING", "REJECTED"],
        },
      },
    });
    return count;
  } catch (error) {
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCountByStatus(
  status: StickerRequestStatus,
  includeDeleted = false
) {
  try {
    const count = await prisma.stickerRequest.count({
      where: {
        status,
        ...(!includeDeleted && { deletedAt: null }),
      },
    });
    return count;
  } catch (error) {
    throw new Error("Failed to count sticker requests by status");
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTotalStickerCost({
  plateNumber,
  asin,
  status,
  includeDeleted = false,
}: StickerRequestParams) {
  try {
    const totalCost = await prisma.stickerRequest.aggregate({
      _sum: {
        stickerCost: true,
      },
      where: {
        ...(plateNumber && { plateNumber }),
        ...(asin && { asin }),
        ...(status && { status }),
        ...(!includeDeleted && { deletedAt: null }),
      },
    });
    return totalCost._sum.stickerCost || 0;
  } catch (error) {
    throw new Error("Failed to calculate total sticker cost");
  } finally {
    await prisma.$disconnect();
  }
}

export async function getLatestStickerRequest({
  plateNumber,
  asin,
  status,
  includeDeleted = false,
}: StickerRequestParams) {
  try {
    const latestRequest = await prisma.stickerRequest.findFirst({
      where: {
        ...(plateNumber && { plateNumber }),
        ...(asin && { asin }),
        ...(status && { status }),
        ...(!includeDeleted && { deletedAt: null }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return latestRequest;
  } catch (error) {
    throw new Error("Failed to fetch latest sticker request");
  } finally {
    await prisma.$disconnect();
  }
}

