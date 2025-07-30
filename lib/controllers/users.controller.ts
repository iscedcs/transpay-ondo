import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { API, URLS } from "../const";

export const getUsers = async (o: {
  offset?: number;
  limit?: number;
  role?: Role;
}) => {
  const session = await auth();

  const headers = {
    "Content-Type": "application/json",
    accept: "*/*",
    Authorization: `Bearer ${session?.user.access_token}`,
  };

  // Build the query string with required filters
  const queryParams = new URLSearchParams();
  if (o.limit) queryParams.append("limit", String(o.limit ?? 10));
  if (o.offset) queryParams.append("offset", String(o.offset ?? 0));
  if (o.role) queryParams.append("role", o.role.toUpperCase());

  const url = `${API}${URLS.user.all}?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 0 },
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      console.log(
        `Failed to fetch users: ${res.status} ${res.statusText}`,
        result
      );
      return undefined;
    }

    const { users, count, pagination } = result.data;

    return {
      rows: users as IAdmin[],
      meta: {
        total: count,
        total_pages: Math.ceil(count / pagination.limit),
        page: Math.floor(pagination.offset / pagination.limit) + 1,
      },
    };
  } catch (error: any) {
    console.log("Error fetching users:", error.message, error);
    return undefined;
  }
};

export const getUser = async (id: string) => {
  try {
    const session = await auth();
    const headers = {
      "Content-Type": "application/json",
      "api-secret": process.env.API_SECRET || "",
      Authorization: `Bearer ${session?.user.access_token}`,
    };
    const url = `${API}${URLS.user.all}/${id}`;
    console.log("Fetched Url :", url);

    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!res.ok || !result.success) {
      console.log("API error:", result);
      return undefined;
    }
    const user: IUserExtended = result.data;
    return user;
  } catch (error) {
    console.log("Error fetching user:", error);
    return null;
  }
};
