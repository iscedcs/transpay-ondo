import { getMe } from "@/actions/users";
import ProtectedRoute from "@/components/auth/protected-wrapper";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Transpay - Dashboard",
  description: "Payment system for the government",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  if (user.user?.status === "BLOCKED") {
    redirect("/blocked");
  }
  return (
    <ProtectedRoute>
      <div className="">
        <Navbar />
        <div className="">
          <Sidebar />
          <div className={`${user.user ? "md:ml-52" : ""} pt-20`}>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
