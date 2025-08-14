"use server";

import { API } from "@/lib/const";
import { revalidatePath } from "next/cache";

export interface Activity {
  id: string;
  name: string;
  description: string;
  userId: string;
  vehicleId: string | null;
  meta: any;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitiesResponse {
  success: boolean;
  message: string;
  rows: Activity[];
  meta: {
    total: number;
    total_pages: number;
    page: number;
  };
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  activityType?: string;
  userId?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getActivities(
  filters: ActivityFilters = {}
): Promise<ActivitiesResponse> {
  try {
    const params = new URLSearchParams();

    // Add pagination
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 20).toString());

    // Add filters if provided
    if (filters.activityType)
      params.append("activityType", filters.activityType);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.vehicleId) params.append("vehicleId", filters.vehicleId);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.search) params.append("search", filters.search);

    const response = await fetch(
      `${API}/api/audit-trails?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch activities");
  }
}

export async function getActivityStats(): Promise<{
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  monthActivities: number;
  topActivityTypes: Array<{ name: string; count: number }>;
}> {
  try {
    // This would typically be a separate endpoint, but we'll simulate it
    const allActivities = await getActivities({ limit: 1000 });
    const activities = allActivities.rows;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayActivities = activities.filter(
      (a) => new Date(a.createdAt) >= today
    ).length;
    const weekActivities = activities.filter(
      (a) => new Date(a.createdAt) >= weekAgo
    ).length;
    const monthActivities = activities.filter(
      (a) => new Date(a.createdAt) >= monthAgo
    ).length;

    // Count activity types
    const typeCount: Record<string, number> = {};
    activities.forEach((activity) => {
      typeCount[activity.name] = (typeCount[activity.name] || 0) + 1;
    });

    const topActivityTypes = Object.entries(typeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalActivities: allActivities.meta.total,
      todayActivities,
      weekActivities,
      monthActivities,
      topActivityTypes,
    };
  } catch (error) {
    return {
      totalActivities: 0,
      todayActivities: 0,
      weekActivities: 0,
      monthActivities: 0,
      topActivityTypes: [],
    };
  }
}

export async function refreshActivities() {
  revalidatePath("/activities");
}
