'use server'

import { auth } from '@/auth';
import { API } from '@/lib/const';
import { revalidatePath } from 'next/cache';

export async function updateStartDate(tCode: string, startDate: string) {
  const session = await auth();  
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  
  try {
    const response = await fetch(`${API}/api/v1/vehicles/calculate-new-owing`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tCode: tCode,
        creation_date: startDate,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update start date");
    }

    const data = await response.json();

    // Revalidate the page where this data is used
    revalidatePath(`/search/${tCode}`);

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to update start date" };
  }
}
