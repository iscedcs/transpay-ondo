"use server";

import axios from "axios";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type {
  VehicleSetting,
  CreateVehicleSettingRequest,
  UpdateVehicleSettingRequest,
  PaginatedResponse,
  VehicleExemptionStatus,
} from "@/types/vehicle-settings";

const API_BASE_URL =
  "https://pre-release-api.transpayedo.com/api/vehicle-settings";

const createApiClient = async () => {
  const session = await auth();
  const token = session?.user?.access_token;

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      accept: "*/*",
    },
  });
};

export async function createVehicleSetting(
  data: CreateVehicleSettingRequest
): Promise<{ success: boolean; data?: VehicleSetting; error?: string }> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.post("/create", data);
    revalidatePath("/settings/vehicle-settings");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to create vehicle setting: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAllNonDeletedSettings(
  page = 1,
  limit = 10
): Promise<{
  success: boolean;
  data?: PaginatedResponse<VehicleSetting>;
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get(
      `/all/non-deleted?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to fetch vehicle settings: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAllSettings(
  page = 1,
  limit = 10
): Promise<{
  success: boolean;
  data?: PaginatedResponse<VehicleSetting>;
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get(`/all?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to fetch all vehicle settings: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getSettingById(
  id: string
): Promise<{ success: boolean; data?: VehicleSetting; error?: string }> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get(`/${id}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to fetch vehicle setting: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateVehicleSetting(
  id: string,
  data: UpdateVehicleSettingRequest
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.patch(`/update/${id}`, data);
    revalidatePath("/settings/vehicle-settings");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to update vehicle setting: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function softDeleteSetting(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiClient = await createApiClient();
    await apiClient.patch(`/delete/${id}`);
    revalidatePath("/settings/vehicle-settings");
    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to delete vehicle setting: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleCvofAll(
  isActive: boolean
): Promise<{ success: boolean; data?: VehicleSetting; error?: string }> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.post("/cvof-all/toggle", { isActive });
    revalidatePath("/settings/vehicle-settings");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to toggle CVOF all status: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getCvofAllStatus(): Promise<{
  success: boolean;
  data?: { isActive: boolean; setting: VehicleSetting };
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get("/cvof-all/status");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to get CVOF all status: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function addVehicleExemption(vehicleId: string): Promise<{
  success: boolean;
  data?: { vehicleId: string; settingId: string };
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.post(
      `/cvof-payment/add-vehicle/${vehicleId}`,
      {}
    );
    revalidatePath("/vehicle-exemptions");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to add vehicle exemption: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function removeVehicleExemption(vehicleId: string): Promise<{
  success: boolean;
  data?: { vehicleId: string; settingId: string };
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.patch(
      `/cvof-payment/remove-vehicle/${vehicleId}`
    );
    revalidatePath("/vehicle-exemptions");
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to remove vehicle exemption: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function checkVehicleExemption(vehicleId: string): Promise<{
  success: boolean;
  data?: VehicleExemptionStatus;
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get(
      `/cvof-payment/check-exemption/${vehicleId}`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to check vehicle exemption: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getExemptedVehicles(
  page = 1,
  limit = 10
): Promise<{
  success: boolean;
  data?: PaginatedResponse<any>;
  error?: string;
}> {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get(
      `/cvof-payment/exempted-vehicles?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to get exempted vehicles: ${
          error.response?.statusText || error.message
        }`,
      };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
