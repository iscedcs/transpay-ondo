'use server'

import { auth } from '@/auth';
import { API } from '@/lib/const';
import { revalidatePath } from 'next/cache';

export async function createNewPassword(userId: string, newPassword: string) {
    const session = await auth();    if (!session || !session.user) {
      throw new Error('Unauthorized')
    }
  try {
    const response = await fetch(`${API}/api/v1/users/set-new-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.access_token}`, // Make sure to set this environment variable
      },
      body: JSON.stringify({ userId, newPassword }),
    });

    if (!response.ok) {
      throw new Error("Failed to set new password");
    }

    const data = await response.json();
    revalidatePath(`/agents/${userId}`);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to set new password" };
  }
}

