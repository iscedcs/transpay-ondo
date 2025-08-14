import { auth } from "@/auth";
import { API, URLS } from "../const";

export const getAllActivities = async (
  session: { user: { access_token: string } },
  o?: {
    page?: string;
    limit?: string;
  }
) => {
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  const url = `${API}${URLS["audit-trails"].all}?page=${o?.page ?? 1}&limit=${
    o?.limit ?? 15
  }`;
  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();

  if (!res.ok || !result.success)
    return { rows: [], meta: { total: 0, total_pages: 0, page: 1 } };
  const activities: {
    rows: IActivity[];
    meta: { total: number; total_pages: number; page: number };
  } = result;
  return activities;
};
export const getActivitiesByUser = async (o: {
  page?: string;
  limit?: string;
  user_id: string;
}) => {
  const session = await auth();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  const url = `${API}${URLS["audit-trails"].user}?page=${o?.page ?? 1}&limit=${
    o?.limit ?? 15
  }&user_id=${o.user_id}`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 },
    cache: "no-store",
  });
  const result = await res.json();
  if (!res.ok || !result.success) {
    return { rows: [], meta: { total: 0, total_pages: 1, page: 1 } };
  }
  const activities: {
    rows: IActivity[];
    meta: { total: number; total_pages: number; page: number };
  } = await result;
  return activities;
};
export const getActivitiesByVehicle = async (o: {
  page?: string;
  limit?: string;
  user_id: string;
}) => {
  const session = await auth();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`,
  };
  const url = `${API}${URLS["audit-trails"].vehicle}?page=${
    o?.page ?? 1
  }&limit=${o?.limit ?? 15}&user_id=${o.user_id}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();
  if (!res.ok || !result.success) {
    return undefined;
  }
  const activities: {
    rows: IActivity[];
    meta: { total: number; total_pages: number; page: number };
  } = await result;
  return activities;
};

export const getActivityById = async (id: string) => {
  const session = await auth();
  if (!session || !session.user || !session.user.access_token) {
    throw new Error("Session or access token is missing");
  }

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.user.access_token}`,
  };
  const url = `${API}${URLS["audit-trails"].single}/${id}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();

  if (!res.ok || !result.success) {
    return undefined;
  }
  const activity: IActivity = result.data;
  return activity;
};