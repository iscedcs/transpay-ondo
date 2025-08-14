"use server";

import { db } from "@/lib/db";
import type { UserRole } from "@/lib/auth";

interface RevenueDataParams {
  userRole: UserRole;
  userLgaId?: string | null;
  lga?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  compare?: boolean;
  lgas?: string[];
}

export async function getRevenueData(params: RevenueDataParams) {
  try {
    const {
      userRole,
      userLgaId,
      lga,
      period = "monthly",
      startDate,
      endDate,
      compare,
      lgas,
    } = params;

    // Determine date range based on period
    const dateRange = getDateRange(period, startDate, endDate);

    // Build base query conditions
    const baseConditions: any = {
      type: "CREDIT",
      status: "SUCCESS",
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    };

    // Apply LGA filtering based on user role
    if (userRole === "LGA_ADMIN" && userLgaId) {
      baseConditions.lgaId = userLgaId;
    } else if (lga && userRole !== "LGA_ADMIN") {
      baseConditions.lgaId = lga;
    }

    // Get main revenue data
    const transactions = await db.vehicleTransaction.findMany({
      where: baseConditions,
      include: {
        LGA: true,
        Vehicle: {
          include: {
            LGA: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get previous period for comparison
    const previousDateRange = getPreviousDateRange(period, dateRange.start);
    const previousTransactions = await db.vehicleTransaction.findMany({
      where: {
        ...baseConditions,
        createdAt: {
          gte: previousDateRange.start,
          lte: previousDateRange.end,
        },
      },
    });

    // Calculate stats
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const previousRevenue = previousTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const totalTransactions = transactions.length;
    const previousTransactionCount = previousTransactions.length;
    const transactionChange =
      previousTransactionCount > 0
        ? ((totalTransactions - previousTransactionCount) /
            previousTransactionCount) *
          100
        : 0;

    // Get active vehicles count
    const activeVehicles = await db.vehicle.count({
      where: {
        ...(userRole === "LGA_ADMIN" && userLgaId
          ? { registeredLgaId: userLgaId }
          : {}),
        ...(lga && userRole !== "LGA_ADMIN" ? { registeredLgaId: lga } : {}),
        status: "ACTIVE",
      },
    });

    // Get outstanding amount (OWING transactions)
    const outstandingTransactions = await db.vehicleTransaction.findMany({
      where: {
        ...baseConditions,
        status: "OWING",
      },
    });
    const outstandingAmount = outstandingTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // Calculate LGA percentage for LGA_ADMIN
    let lgaPercentage = 0;
    if (userRole === "LGA_ADMIN" && userLgaId) {
      const stateWideRevenue = await db.vehicleTransaction.aggregate({
        where: {
          type: "CREDIT",
          status: "SUCCESS",
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const stateTotal = Number(stateWideRevenue._sum.amount || 0);
      lgaPercentage = stateTotal > 0 ? (totalRevenue / stateTotal) * 100 : 0;
    }

    // Get available LGAs for filtering
    const availableLGAs =
      userRole !== "LGA_ADMIN"
        ? await db.lGA.findMany({
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          })
        : [];

    // Generate chart data
    const chartData = generateChartData(transactions, period);

    // Generate table data
    const tableData = generateTableData(transactions);

    // Generate comparison data if needed
    let comparisonData = null;
    if (compare && lgas && lgas.length > 0 && userRole !== "LGA_ADMIN") {
      comparisonData = await generateComparisonData(lgas, dateRange);
    }

    return {
      stats: {
        totalRevenue,
        revenueChange: Math.round(revenueChange * 100) / 100,
        totalTransactions,
        transactionChange: Math.round(transactionChange * 100) / 100,
        activeVehicles,
        outstandingAmount,
        lgaPercentage: Math.round(lgaPercentage * 100) / 100,
      },
      chartData,
      tableData,
      comparisonData,
      availableLGAs,
    };
  } catch (error) {
    throw new Error("Failed to fetch revenue data");
  }
}

export async function exportRevenueData(
  params: RevenueDataParams & { format: "excel" | "pdf" }
) {
  try {
    // This would integrate with your export service
    // For now, we'll just simulate the export
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real implementation, you would:
    // 1. Generate the export file using libraries like xlsx or puppeteer
    // 2. Upload to cloud storage or serve directly
    // 3. Return download URL or trigger download

    return { success: true };
  } catch (error) {
    throw new Error("Failed to export revenue data");
  }
}

// Helper functions
function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date();

  if (startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    };
  }

  switch (period) {
    case "daily":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        ),
      };
    case "weekly":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return {
        start: weekStart,
        end: now,
      };
    case "yearly":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      };
    default: // monthly
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
  }
}

function getPreviousDateRange(period: string, currentStart: Date) {
  const start = new Date(currentStart);

  switch (period) {
    case "daily":
      start.setDate(start.getDate() - 1);
      return {
        start,
        end: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          23,
          59,
          59
        ),
      };
    case "weekly":
      start.setDate(start.getDate() - 7);
      return {
        start,
        end: new Date(currentStart.getTime() - 1),
      };
    case "yearly":
      start.setFullYear(start.getFullYear() - 1);
      return {
        start,
        end: new Date(currentStart.getTime() - 1),
      };
    default: // monthly
      start.setMonth(start.getMonth() - 1);
      return {
        start,
        end: new Date(currentStart.getTime() - 1),
      };
  }
}

function generateChartData(transactions: any[], period: string) {
  // Group transactions by time period
  const grouped = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt);
    let key: string;

    switch (period) {
      case "daily":
        key = date.toISOString().split("T")[0];
        break;
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "yearly":
        key = date.getFullYear().toString();
        break;
      default: // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
    }

    if (!acc[key]) {
      acc[key] = { revenue: 0, transactions: 0 };
    }

    acc[key].revenue += Number(transaction.amount);
    acc[key].transactions += 1;

    return acc;
  }, {} as Record<string, { revenue: number; transactions: number }>);

  return Object.entries(grouped)
    .map(([period, data]) => ({
      period,
      // @ts-expect-error: garri error
      revenue: data.revenue,
      // @ts-expect-error: garri error
      transactions: data.transactions,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

function generateTableData(transactions: any[]) {
  return transactions.map((transaction) => ({
    id: transaction.id,
    date: transaction.createdAt,
    amount: Number(transaction.amount),
    vehicle: transaction.vehicle?.plateNumber || "N/A",
    lga: transaction.lga?.name || "N/A",
    paymentType: transaction.paymentType,
    status: transaction.status,
  }));
}

async function generateComparisonData(
  lgaIds: string[],
  dateRange: { start: Date; end: Date }
) {
  const comparisonData = await Promise.all(
    lgaIds.map(async (lgaId) => {
      const transactions = await db.vehicleTransaction.findMany({
        where: {
          lgaId,
          type: "CREDIT",
          status: "SUCCESS",
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        include: {
          LGA: true,
        },
      });

      const revenue = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      return {
        lgaId,
        lgaName: transactions[0]?.LGA?.name || "Unknown",
        revenue,
        transactions: transactions.length,
      };
    })
  );

  return comparisonData.sort((a, b) => b.revenue - a.revenue);
}
