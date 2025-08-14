"use server"

import { signIn } from "@/auth";
import { API } from "@/lib/const";

interface AuthResponse {
  success: boolean;
  message: string;
}

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  await signIn("credentials", {
    email: credentials.email,
    password: credentials.password,
    redirect: true,
    callbackUrl: "/dashboard",
  });
};

/**
 * Send reset token to email
 * @param email - User's email address
 * @returns Promise with response data
 */
export async function sendResetTokenEmail(
  email: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API}/api/auth/send-reset-token-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to send reset token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to send reset token to email"
    );
  }
}

/**
 * Send reset token to phone
 * @param phone - User's phone number
 * @returns Promise with response data
 */
export async function sendResetTokenPhone(
  phone: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API}/api/auth/send-reset-token-phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to send reset token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to send reset token to phone"
    );
  }
}

/**
 * Reset password using email
 * @param email - User's email address
 * @param resetCode - Reset code received via email
 * @param newPassword - New password
 * @returns Promise with response data
 */
export async function resetPasswordEmail(
  email: string,
  resetCode: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API}/api/auth/reset-password-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({
        email,
        resetCode,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to reset password: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to reset password"
    );
  }
}

/**
 * Reset password using phone
 * @param phone - User's phone number
 * @param resetCode - Reset code received via SMS
 * @param newPassword - New password
 * @returns Promise with response data
 */
export async function resetPasswordPhone(
  phone: string,
  resetCode: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API}/api/auth/reset-password-phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({
        phone,
        resetCode,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to reset password: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to reset password"
    );
  }
}
