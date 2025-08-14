import { Vehicle } from "@prisma/client";
import { API, URLS } from "../const";
import { getSSession } from "../get-data";
import { isBarcodeId, isUUID } from "../utils";

export const runtime = "edge"; // 'nodejs' is the default
export const dynamic = "force-dynamic";

export const getVehicles = async (page?: string, limit?: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  const url = `${API}${URLS.vehicle.all}?page=${page ?? 1}&limit=${
    limit ?? 10
  }`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorText = await res.text();
    return undefined;
  }

  const result = await res.json();
  const vehicles: Vehicle[] = result.data;
  const meta: { total: number; total_pages: number; page: number } =
    result.meta;
  try {
    return {
      rows: vehicles,
      meta,
    };
  } catch (error: any) {
    return undefined;
  }
};

export const getGroups = async (page?: string, limit?: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  try {
    const url = `${API}${URLS.group.all}?page=${page ?? 1}&limit=${
      limit ?? 10
    }`;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return undefined;
    const result = await res.json();
    const group: {
      rows: IGroup[];
      meta: { total: number; total_pages: number; page: number };
    } = result.data;
    return group;
  } catch (error: any) {
    return undefined;
  }
};

export const getVehicleById = async (id: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  const url = isUUID(id)
    ? `${API}${URLS.vehicle.all}/${id}`
    : isBarcodeId(id)
    ? `${API}${URLS.vehicle.all}/barcode/${id}`
    : `${API}${URLS.vehicle.all}/plate-number/${id}`;

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) {
      return undefined;
    }

    const result = await res.json();

    if (!result.success) {
      // Check result.success instead of result.status

      return undefined;
    }

    const vehicle: IVehicle = result.data;

    if (typeof vehicle.owner.address === "string") {
      if (typeof vehicle.owner.address === "string") {
        vehicle.owner.address = JSON.parse(vehicle.owner.address);
      }
      if (typeof vehicle.owner.identification === "string") {
        vehicle.owner.identification = JSON.parse(vehicle.owner.identification);
      }
    }

    return vehicle;
  } catch (error: any) {
    return undefined;
  }
};

export const getVehicleGroupById = async (id: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  const url = `${API}${URLS.group.all}/${id}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();
  if (!result.status) return undefined;

  const group = result.data;
  return group;
};

export const getVehicleByPlateNumber = async (plateNumber: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  const url = `${API}${URLS.vehicle.all}/plate-number/${plateNumber}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();
  if (!result.status) return undefined;

  const vehicle: IVehicle = result.data;
  return vehicle;
};

export const getVehicleByTCodeOrPlateNumber = async (id: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };

  try {
    const asinUrl = `${API}${URLS.vehicle.asin}/${id}`;
    const res = await fetch(asinUrl, { headers, cache: "no-store" });
    if (!res.ok) {
      return undefined;
    }
    const externalVehicleData = await res.json();

    const existingVehicle = await getVehicleByPlateNumber(
      externalVehicleData.data.plateNumber
    );
    if (!existingVehicle) {
      return undefined;
    }
    return existingVehicle;
  } catch (error) {
    return undefined;
  }
};

export const verifyVehicleByAsin = async (asin: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };
  try {
    const url = `${API}${URLS.vehicle.asin}/${asin}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    const result = await res.json();
    if (!result.status) return undefined;

    const vehicle: IVehicle = result.data;
    return vehicle;
  } catch (error) {
    return undefined;
  }
};

export const getVehicleSummary = async (plateNumber: string) => {
  const headers = {
    "Content-Type": "application/json",
  };

  let url;
  if (isUUID(plateNumber)) {
    url = `${API}${URLS.vehicle.all}/summary?id=${plateNumber}`;
  } else if (isBarcodeId(plateNumber)) {
    url = `${API}${URLS.vehicle.all}/summary?barcode=${plateNumber}`;
  } else {
    url = `${API}${URLS.vehicle.all}/summary?plateNumber=${plateNumber}`;
  }

  const res = await fetch(url, { headers, cache: "no-store" });
  const result = await res.json();

  if (!res.ok) {
    return undefined;
  }

  const summary: IVehicleSummary = result;
  return summary;
};

export const searchVehicle = async (id: string) => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };

  const url = isUUID(id)
    ? `${API}${URLS.vehicle.search}?id=${id}`
    : `${API}${URLS.vehicle.search}?plateNumber=${id}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return undefined;
  const result = await res.json();
  const vehicle = result.data;
  return vehicle;
};

export const getVehiclePaymentHistoryById = async (
  id: string
): Promise<IPaymnetHistory[]> => {
  const session = await getSSession();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${session.access_token}`,
  };

  const url = `${API}${URLS.vehicle.payment}/${id}/cvof`;

  try {
    const request = await fetch(url, { headers, cache: "no-store" });
    const response = await request.json();
    if (response.status) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
