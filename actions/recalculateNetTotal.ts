"use server"

import { auth } from "@/auth";
import { API } from "@/lib/const";


export async function recalculateNetTotal(tCode: string) {
  const session = await auth();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  try {
    const response = await fetch(`${API}/api/v1/vehicles/${tCode}/net-total`, {
      method: "PUT",
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return { success: true, message: result.data.message }
  } catch (error) {
    return {
      success: false,
      message: "Failed to recalculate net total. Please try again.",
    };
  }
}