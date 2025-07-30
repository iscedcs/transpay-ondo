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
    console.log(url);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();
    console.log("Agent Result", result);
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

  let phone = body.phone;
  if (phone && phone.startsWith("+234")) {
    phone = "0" + phone.slice(4);

    const updateAgentPayload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: phone,
      blacklisted: body.blacklisted ?? false,
      address: {
        text: body.address?.text ?? "",
        lga: body.address?.lga ?? "",
        city: body.address?.city ?? "",
        state: body.address?.state ?? "",
        unit: body.address?.unit ?? "",
        country: body.address?.country ?? "",
        postal_code: body.address?.postal_code ?? "",
      },
      identification: {
        type: body.identification?.type ?? "",
        number: body.identification?.number ?? "",
      },
    };

    try {
      const url = `${API}${URLS.user.update}/${body.id}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updateAgentPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          `Backend API error: ${
            result.message || result.error || "Unknown error"
          }`
        );
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.log("Error updating agent:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
