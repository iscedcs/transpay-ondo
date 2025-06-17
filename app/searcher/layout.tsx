import NavBar from "@/components/layout/navbar";
import type { Metadata } from "next";
export const metadata: Metadata = {
     title: "Transpay - Search Vehicle",
     description: "Payment system for the government",
};

export default function DashboardLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <div className="">
               <NavBar />
               <div className="">
                    <div className="p-2">{children}</div>
               </div>
          </div>
     );
}
