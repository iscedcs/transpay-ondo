"use server";

import { auth } from "@/auth";
import axios from "axios";
import { revalidatePath } from "next/cache";
import type {
  WhitelistResponse,
  AddWhitelistResponse,
  AddWhitelistRequest,
} from "@/types/ip-whitelist";

const API_BASE_URL = "https://pre-release-transpay-ondo.vercel.app/api";

async function createApiClient() {
  const session = await auth();

  if (!session?.user.access_token) {
    throw new Error("No authentication token available");
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${session.user.access_token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function getAllWhitelistedIPs() {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get<WhitelistResponse>(
      "/superadmin/whitelist/all"
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching whitelisted IPs:", error);
    return {
      success: false,
      data: [],
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch whitelisted IPs"
        : "An unexpected error occurred",
    };
  }
}

export async function addWhitelistedIP(data: AddWhitelistRequest) {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.post<AddWhitelistResponse>(
      "/superadmin/whitelist/add",
      data
    );

    revalidatePath("/ip-whitelist");
    revalidatePath("/settings");

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error adding whitelisted IP:", error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to add IP to whitelist"
        : "An unexpected error occurred",
    };
  }
}

export async function removeWhitelistedIP(ip: string) {
  try {
    const apiClient = await createApiClient();
    await apiClient.delete(
      `/superadmin/whitelist/delete/${encodeURIComponent(ip)}`
    );

    revalidatePath("/ip-whitelist");
    revalidatePath("/settings");

    return {
      success: true,
      message: "IP removed from whitelist successfully",
    };
  } catch (error) {
    console.error("Error removing whitelisted IP:", error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to remove IP from whitelist"
        : "An unexpected error occurred",
    };
  }
}
