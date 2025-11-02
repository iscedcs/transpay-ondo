"use client";

import {
  AGENCY_ADMIN,
  AGENCY_AGENT,
  SIDEBAR_LINKS,
  SIDEBAR_LINKS_ADMIN,
  SIDEBAR_LINKS_ODIRS_ADMIN,
  SIDEBAR_LINKS_ODIRS_C_AGENT,
  SIDEBAR_NO_USER,
} from "@/lib/const";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { NavbarButton } from "./navbar-button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, URLS } from "@/lib/const";

export default function Sidebar() {
  const { data: session } = useSession();
  const [agencyId, setAgencyId] = useState<string | null>(null);

  const ROLE = session?.user?.role;

  useEffect(() => {
    const fetchAgencyId = async () => {
      if (ROLE === Role.AGENCY_ADMIN && session?.user?.id) {
        try {
          const res = await axios.get(
            `${API}${URLS.agency.one_agency_admin.replace(
              "{id}",
              session.user.id
            )}`,
            {
              headers: {
                Authorization: `Bearer ${session.user.access_token}`,
              },
            }
          );
          if (res.data?.success && res.data.data?.agency?.id) {
            setAgencyId(res.data.data.agency.id);
          } else {
            console.warn("No agency ID found in response:", res.data);
          }
        } catch (err) {
          console.error("Failed to fetch agency info:", err);
        }
      }
    };
    fetchAgencyId();
  }, [ROLE, session?.user.id]);

  if (!ROLE) return null;

  const links =
    ROLE.toLowerCase() === "agent"
      ? SIDEBAR_LINKS_ODIRS_C_AGENT
      : ROLE === Role.ODIRS_ADMIN
      ? SIDEBAR_LINKS_ODIRS_ADMIN
      : ROLE === Role.AGENCY_AGENT
      ? AGENCY_AGENT
      : ROLE === Role.AGENCY_ADMIN
      ? AGENCY_ADMIN(agencyId!)
      : ROLE === Role.ADMIN
      ? SIDEBAR_LINKS_ADMIN
      : ROLE === Role.SUPERADMIN
      ? SIDEBAR_LINKS
      : SIDEBAR_NO_USER;

  return (
    <div className="no-scrollbar fixed z-10 hidden h-full w-52 justify-between overflow-y-scroll text-secondary bg-white/50 backdrop-blur px-5 md:flex border-r">
      <div className="flex h-full w-full flex-col gap-3 pt-20">
        {Array.isArray(links) &&
          links.map((link, i) => {
            const Icon = link.icon;
            return (
              <NavbarButton
                key={i}
                title={link.title}
                href={link.href}
                icon={
                  React.isValidElement(Icon)
                    ? Icon
                    : typeof Icon === "function"
                    ? React.createElement(Icon as React.ComponentType<any>, {
                        className: "h-4 w-4",
                      })
                    : null
                }
              />
            );
          })}
      </div>
    </div>
  );
}
