"use client";

import {
  SIDEBAR_LINKS,
  SIDEBAR_LINKS_ADMIN,
  SIDEBAR_LINKS_EIRS_ADMIN,
  SIDEBAR_LINKS_LGA_ADMIN,
  SIDEBAR_LINKS_LGA_AGENT,
  SIDEBAR_LINKS_LGA_C_AGENT,
  SIDEBAR_NO_USER,
} from "@/lib/const";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { NavbarButton } from "./navbar-button";

export default function Sidebar() {
  const session = useSession();
  const ROLE = session.data?.user.role;

  // if (session.status === "loading") {
  //      return (
  //           <div className="no-scrollbar fixed z-10 hidden h-full w-52 justify-between overflow-y-scroll bg-secondary px-5 md:flex">
  //                <div className="flex h-full w-full flex-col gap-3 pt-20">
  //                     {[1, 2, 3, 4, 5, 6, 7].map((i) => (
  //                          <Skeleton
  //                               key={i}
  //                               className="h-10 w-full rounded bg-primary/30"
  //                          />
  //                     ))}
  //                </div>
  //           </div>
  //      );
  // }

  return (
    <div className="no-scrollbar fixed z-10 hidden h-full w-52 justify-between overflow-y-scroll text-secondary bg-white/50 backdrop-blur px-5 md:flex shadow-xl">
      <div className="flex h-full w-full flex-col gap-3 pt-20">
        {(ROLE?.toLowerCase() === "agent"
          ? SIDEBAR_LINKS_LGA_AGENT
          : ROLE === Role.LGA_ADMIN
          ? SIDEBAR_LINKS_LGA_ADMIN
          : ROLE === Role.LGA_AGENT
          ? SIDEBAR_LINKS_LGA_C_AGENT
          : ROLE === Role.EIRS_ADMIN
          ? SIDEBAR_LINKS_EIRS_ADMIN
          : ROLE === Role.ADMIN
          ? SIDEBAR_LINKS_ADMIN
          : ROLE === Role.SUPERADMIN
          ? SIDEBAR_LINKS
          : SIDEBAR_NO_USER
        ).map((link, i) => (
          <NavbarButton
            key={i}
            title={link.title}
            href={link.href}
            icon={link.icon}
          />
        ))}
        {/* <Separator />
        <ModeToggle /> */}
      </div>
    </div>
  );
}
