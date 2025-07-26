import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Transpay - Vehicles",
  description: "List of all vehicles",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    //     <RoleGateServer
    //       opts={{
    //         allowedRole: [
    //           Role.ADMIN,
    //           Role.SUPERADMIN,
    //           Role.EIRS_ADMIN,
    //           Role.EIRS_AGENT,
    //         ],
    //       }}
    //     >
    <div className="flex h-full w-full flex-col p-2">{children}</div>
    //     </RoleGateServer>
  );
}
