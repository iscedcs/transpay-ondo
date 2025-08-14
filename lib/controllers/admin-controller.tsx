import { auth } from "@/auth";
import { API, URLS } from "../const";

export const getAdminMe = async () => {
     const session = await auth();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${session?.user.access_token}`,
     };
     const url = API + URLS.admin.me;
     const res = await fetch(url, { headers, cache: "no-store" });
     const data: Promise<IAdminMe> = await res.json();
     if (!res.ok) return undefined;

     const admin = (await data).data.admin;
     return admin;
};

export const getAdmins = async () => {
     const session = await auth();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${session?.user.access_token}`,
     };
     // const url = API + URLS.admin.all;
     const url = API + URLS.user;
     const res = await fetch(url, { headers, next: { revalidate: 0 } });
     if (!res.status) return undefined;
     const data = await res.json();
     const admins: IAdmin[] = (await data).data;
     return admins;
};

export const getAdminById = async (id: string) => {
     const session = await auth();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${session?.user.access_token}`,
     };
     const url = `${API}${URLS.admin.all}/${id}`;
     const res = await fetch(url, { headers, cache: "no-store" });
     if (!res.ok) return undefined;
     const result: Promise<IResAdmin> = (await res.json()).data;
     const { admin } = await result;
     return admin;
};
export const getAgentRegisteredByAdminId = async ({
     userId,
     page = 1,
     pageSize = 10,
}: {
     userId: string;
     page?: number;
     pageSize?: number;  
}) => {
     const session = await auth();
     const headers = {
         "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session?.user.access_token}`, 
     };

     const url = `${API}${URLS["audit-trails"].user}?userId=${userId}&page=${page}&lmit=${pageSize}`;
     

     const res = await fetch(url, { headers, cache: "no-store" });

     if (!res.ok) {
       return undefined;
     }
   
     const data = await res.json();
     return data;
}

export const deleteAdminById = async (id: string) => {
     const session = await auth();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${session?.user.access_token}`,
     };
     const url = `${API}${URLS.admin.all}/${id}`;
     const res = await fetch(url, {
          method: "delete",
          headers,
          cache: "no-store",
     });
     if (!res.ok) return undefined;
     const data = await res.json();
     const response = await data;
     return response;
};
