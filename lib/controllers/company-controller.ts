"use server";
  {/* @ts-ignore */}
import { companies, Vehicle } from "@prisma/client";
import { API, URLS } from "../const";
import { getSSession } from "../get-data";

export const getCompanies = async (
  page?: string,
  limit?: string,
  charges?: boolean
) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.admin_fetch}?page=${page ?? 1}&limit=${
      limit ?? 10
    }&charges=${false}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const rows: companies[] = result.data.data;
    const filteredCompanies = rows.filter(
      (company) => company.deleted_at === null
    );
    const totalCompanies: number = filteredCompanies.length;
    const currentPage: number = result.data.currentPage;
    const totalPages: number = result.data.totalPages;

    return {
      filteredCompanies,
      meta: { totalCompanies, totalPages, currentPage },
    };
  } catch (e) {
    return undefined;
  }
};

export const getCompanyById = async (id: string) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.one.replace("{id}", id)}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const data = result.data.data;

    return data;
  } catch (e) {
    return undefined;
  }
};

// export const getDirectorsCount = async (id: string) => {
//   const { access_token } = await getSSession();

//   const headers = {
//     "Content-Type": "application/json",
//     "api-secret": process.env.API_SECRET || "",
//     Authorization: `Bearer ${access_token}`,
//   };

//   try {
//     const url = `${API}${URLS.companies.one.replace("{id}", id)}`;
//     const res = await fetch(url, { headers, next: { revalidate: 0 } });
//     const result = await res.json();
//     if (!result.status) return undefined;

//     const data = result.data.data.directors.length;
//     return data;
//   } catch (e) {
//     return undefined;
//   }
// };

export const getDeletedCompanies = async (
  page?: string,
  limit?: string,
  charges?: boolean
) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.admin_fetch}?page=${page ?? 1}&limit=${
      limit ?? 10
    }&charges=${false}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const rows: companies[] = result.data.data;
    const filteredCompanies = rows.filter(
      (company) => company.deleted_at != null
    );
    const totalCompanies: number = filteredCompanies.length;
    const currentPage: number = result.data.currentPage;
    const totalPages: number = result.data.totalPages;
    return {
      filteredCompanies,
      meta: { totalCompanies, totalPages, currentPage },
    };
  } catch (e) {
    return undefined;
  }
};

export const basicUserGetAllCompanies = async (
  page?: string,
  limit?: string,
  charges?: boolean
) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.all}?page=${page ?? 1}&limit=${
      limit ?? 10
    }&charges=${false}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const rows: companies[] = result.data.data;
    
    const totalCompanies: number = result.data.totalCompanies;
    const currentPage: number = result.data.currentPage;
    const totalPages: number = result.data.totalPages;

    return {
      rows,
      meta: { totalCompanies, totalPages, currentPage },
    };
  } catch (e) {
    return undefined;
  }
};

export const getVehiclesFromCompanies = async (
  id: string,
  page?: string,
  limit?: string
) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.vehicles.replace(
      "{companyId}",
      id
    )}?page=${page ?? 1}&limit=${limit ?? 10}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const success: boolean = result.data.success;
    const rows: Vehicle[] = result.data.data.vehicles;
    const totalVehicles: number = result.data.data.totalVehicles;
    const currentPage: number = result.data.data.currentPage;
    const perPage: number = result.data.data.perPage;
    const totalPages: number = result.data.data.totalPages;
    
    return {
      success,
      rows,
      meta: {
        totalVehicles,
        currentPage,
        perPage,
        totalPages,
      },
    };
  } catch (e) {
    return undefined;
  }
};
export const getDirectorLengthFromCompanies = async (
  id: string,
  page?: string,
  limit?: string
) => {
  const { access_token } = await getSSession();

  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.vehicles.replace(
      "{companyId}",
      id
    )}?page=${page ?? 1}&limit=${limit ?? 10}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;

    const success: boolean = result.data.success;
    const rows: Vehicle[] = result.data.data.vehicles;
    const totalVehicles: number = result.data.data.totalVehicles;
    const currentPage: number = result.data.data.currentPage;
    const perPage: number = result.data.data.perPage;
    const totalPages: number = result.data.data.totalPages;
    
    return {
      success,
      rows,
      meta: {
        totalVehicles,
        currentPage,
        perPage,
        totalPages,
      },
    };
  } catch (e) {
    return undefined;
  }
};

export const getCompaniesByUserID = async (
  id: string | "",
  page?: string,
  limit?: string
) => {
  const { access_token } = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.companies.company_total.replace(
      "{userId}",
      id
    )}?page=${page ?? 1}&limit=${limit ?? 10}`;
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    const result = await res.json();
    if (!result.status) return undefined;
    

    const totalCompanies: number = result.data.totalCompanies;
    const companies: companies[] = result.data.companies;
    

    return {
      totalCompanies,
      companies,
    };
  } catch (e) {
    return undefined;
  }
};
