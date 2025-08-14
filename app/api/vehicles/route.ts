import { db } from "@/lib/db";
import { Prisma, VehicleCategories } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const type = url.searchParams.get("type");
  const search = url.searchParams.get("search");

  const where: Prisma.VehicleWhereInput = {};

  if (status) where.status = status as any; // Cast to VehicleStatus enum
  if (category) where.category = category as VehicleCategories;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { User: { is: { firstName: { contains: search } } } },
      { plateNumber: { contains: search, mode: "insensitive" } },
      { vin: { contains: search, mode: "insensitive" } },
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

  return NextResponse.json({
    vehicles,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
}
