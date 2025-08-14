import { API, URLS } from "@/lib/const";
import { getSSession } from "@/lib/get-data";
import { safeString, safeToUpperCase, transformPhoneNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token } = await getSSession();
  const body: ICreateVehicleForm = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };
  const payload = body;
  const url = API + URLS.vehicle.all;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  try {
    if (!response.ok) {
      return NextResponse.json(result, { status: 400 });
    } else {
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { access_token } = await getSSession();
  const body = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };
  const payload = {
    category: safeToUpperCase(body.category),
    plateNumber: safeToUpperCase(body.plateNumber),
    color: safeToUpperCase(body.color),
    image: body.image,
    status: safeToUpperCase(body.status),
    type: safeToUpperCase(body.type) || "",
    vin: body.vin,
    trackerId: body.tracker_id || "",
    blacklisted: body.blacklisted,
    owner: {
      firstName: safeString(body.owner?.firstName),
      lastName: safeString(body.owner?.lastName),
      phone: transformPhoneNumber(body.owner?.phone),
      address: {
        text: safeString(body.owner?.address?.text),
        lga: safeString(body.owner?.address?.lga),
        city: safeString(body.owner?.address?.city),
        state: safeString(body.owner?.address?.state),
        unit: safeString(body.owner?.address?.unit),
        country: safeString(body.owner?.address?.country),
        postal_code: safeString(body.owner?.address?.postal_code),
      },
      gender: safeToUpperCase(body.owner?.gender || "MALE"),
      marital_status: safeToUpperCase(body.owner?.marital_status || "SINGLE"),
    },
  };

  const url = `${API}${URLS.vehicle.all}/${body.id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  try {
    if (!response.ok) {
      return NextResponse.json(
        { error: result },
        {
          status: result.statusCode || 400,
        }
      );
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { access_token } = await getSSession();
  const body: ICreateVehicleForm = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.vehicle.all}/${body.vehicle_id}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Something Went wrong ${response.statusText}`);
    } else {
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return error?.message;
  }
}
