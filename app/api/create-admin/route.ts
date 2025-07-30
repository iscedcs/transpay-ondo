import { API, URLS } from "@/lib/const";
import { getSSession } from "@/lib/get-data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token } = await getSSession();
  const body: IUserExtended = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };
  try {
    const url = API + URLS.user.create;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json({ result }, { status: response.status });
    } else {
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { access_token } = await getSSession();
  const body: IUserExtended = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };
  const updateAdminPayload = {
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    blacklisted: body.blacklisted,
    address: {
      text: body.address?.text,
      lga: body.address?.lga,
      city: body.address?.city,
      state: body.address?.state,
      unit: body.address?.unit,
      country: body.address?.country,
      postal_code: body.address?.postal_code,
    },
    identification: {
      type: body.identification?.type,
      number: body.identification?.number,
    },
  };
  try {
    const url = `${API}${URLS.user}/${body.id}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateAdminPayload),
    });
    const result = await response.json();
    if (!result.status) {
      throw new Error(
        `Something Went wrong ${
          result.errors.message[0] ?? result.error.message
        }`
      );
    } else {
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return error?.message;
  }
}

export async function DELETE(req: NextRequest) {
  const { access_token } = await getSSession();
  const body: IUserExtended = await req.json();
  const headers = {
    "Content-Type": "application/json",
    "api-secret": process.env.API_SECRET || "",
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const url = `${API}${URLS.user}/${body.id}`;
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
