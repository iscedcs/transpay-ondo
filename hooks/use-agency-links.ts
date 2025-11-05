// hooks/useAgencyLinks.ts
"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function useAgencyLinks() {
  const { id } = useParams();
  const agencyId = Array.isArray(id) ? id[0] : id;

  const { data: session } = useSession();
  const sessionAgencyId = session?.user?.id; // assuming your token includes agencyId
  const activeAgencyId = agencyId || sessionAgencyId;

  if (!activeAgencyId) return [];

  return [
    {
      title: "Dashboard",
      href: `/agency/${activeAgencyId}`,
      icon: "🏠",
    },
    {
      title: "Agents",
      href: `/agency/${activeAgencyId}/agents`,
      icon: "👥",
    },
    {
      title: "Commission",
      href: `/agency/${activeAgencyId}/settlement`,
      icon: "💰",
    },
    {
      title: "Transactions",
      href: `/agency/${activeAgencyId}/transactions`,
      icon: "📊",
    },
  ];
}
