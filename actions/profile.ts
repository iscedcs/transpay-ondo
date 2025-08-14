"use server";

import { auth } from "@/auth";
import { API } from "@/lib/const";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  blacklisted: boolean;
  address: string | null;
  identification: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  lgaId: string | null;
  lga: any | null;
  gender: string | null;
  whatsapp: string | null;
  createdBy: string | null;
  maiden_name: string | null;
  marital_status: string | null;
  nok_name: string | null;
  nok_phone: string | null;
  nok_relationship: string | null;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}
const BASE_URL = API;

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile> {
  try {
    const session = await auth();
    const AUTH_TOKEN = session?.user.access_token;
    const response = await fetch(`${BASE_URL}/api/user/me`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please sign in.");
      }
      throw new Error(
        `Failed to fetch profile: ${response.status} ${response.statusText}`
      );
    }

    const data: ProfileResponse = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch profile"
    );
  }
}

/**
 * Update current user profile
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const session = await auth();
    const AUTH_TOKEN = session?.user.access_token;
    const response = await fetch(`${BASE_URL}/api/user/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please sign in.");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to update profile: ${response.status} ${response.statusText}`
      );
    }

    // The API returns a different structure for updates, so we need to fetch the full profile again
    const updatedProfile = await getCurrentUserProfile();

    // Revalidate the profile page
    revalidatePath("/profile");

    return updatedProfile;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile"
    );
  }
}

/**
 * Update specific profile field
 */
export async function updateProfileField(
  field: keyof UserProfile,
  value: any
): Promise<UserProfile> {
  return updateUserProfile({ [field]: value });
}

/**
 * Update multiple profile fields
 */
export async function updateProfileFields(
  fields: Partial<UserProfile>
): Promise<UserProfile> {
  return updateUserProfile(fields);
}
