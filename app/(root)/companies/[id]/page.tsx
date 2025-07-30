import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { auth } from "@/auth";
import RemoveVehicleFromCompany from "@/components/shared/delete-buttons/remove-vehicle-from-company";
import RoleGateServer from "@/components/shared/RoleGate";
import { AddVehicleToGroupModal } from "@/components/ui/add-to-vehicle-group";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateAddModal } from "@/components/update-modal-group";
import { HAS_COMPANY_ACCESS } from "@/lib/const";
import {
  getCompanyById,
  getVehiclesFromCompanies,
} from "@/lib/controllers/company-controller";
import { format } from "date-fns";
import { AlertOctagon, Car, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const id = (await params).id;
  const company = await getCompanyById(id);
  if (!company) return notFound();

  return {
    title: `Transpay - ${company.name} Group`,
  };
}

export default async function IndividualGoupPage({
  params,
  searchParams,
}: PageProps) {
  const id = (await params).id;
  const session = await auth();
  if (!session?.user.role) return redirect("/sign-in");

  const role = session.user.role;
  const IsCompanyAgent = HAS_COMPANY_ACCESS.includes(
    role as (typeof HAS_COMPANY_ACCESS)[number]
  );
  const page = (await searchParams)["page"] ?? "1";
  const limit = (await searchParams)["limit"] ?? "3";
  const company = await getCompanyById(id);
  const vehicles = await getVehiclesFromCompanies(id, page, limit);

  const directors = company.directors;
  if (!company) return notFound();
  return (
    <RoleGateServer opts={{ allowedRole: HAS_COMPANY_ACCESS }}>
      <div className="px-4">
        <div className=" flex flex-row justify-between mb-4">
          <div>
            <p className=" font-bold text-2xl">{company.name}</p>
            <span className=" flex gap-3 text-[12px] text-gray-500 items-center">
              <p className="  ">
                Created on{" "}
                {format(new Date(company.created_at), "LLLL dd, yyyy")}
              </p>{" "}
              • <p> {company.category} </p>
            </span>
          </div>
          <div className="">
            <Dialog>
              <Dialog>
                <UpdateAddModal company={company} />
              </Dialog>
            </Dialog>
          </div>
        </div>
        <Card className="mb-[20px] pr-[20px] flex flex-col md:flex-row justify-between text-[14px] ">
          <div className="">
            <CardHeader className=" gap-2 flex flex-row items-center font-bold">
              <AlertOctagon /> Company Information
            </CardHeader>
            <CardContent>
              <span>
                {company.asin && <p>Company ASIN: {company.asin}</p>}
                <p>Company Address: {company.address}</p>
                <p>Company Phone Number: {company.phone}</p>
              </span>
            </CardContent>
          </div>
          <div className="flex items-center md:pb-0 md:ml-0 pb-[20px] ml-[20px] justify-between font-bold uppercase">
            {session.user &&
              session.user.role?.toLowerCase() !== "green_engine" && (
                <div className="shrink-0 grow-0">
                  <Dialog>
                    <AddVehicleToGroupModal group={id} />
                  </Dialog>
                </div>
              )}
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Link href={`/companies/${id}/vehicles`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vehicles?.meta.totalVehicles ?? 0}
                </div>
              </CardContent>
            </Link>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payment Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦0</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Tabs defaultValue="directors">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="directors">Directors</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="directors" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="shrink-0 grow-0 font-bold text-xl">
                    Registered Directors
                  </CardTitle>
                  <CardDescription>
                    Overview of the directors registered in the company
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {directors.map((director: any) => (
                      <div
                        key={director.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="grid gap-1">
                          <div className="text-sm">
                            Director Name: {director.name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Director ASIN: {director.asin_number}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Director Phone Number: {director.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Director Email ID: {director.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {director.deleted_at === null && (
                            <div className=" rounded-full px-2.5 py-0.5 text-xs font-medium  bg-emerald-600/25 text-emerald-700 ">
                              Active
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="vehicles" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="shrink-0 grow-0 font-bold text-xl">
                    Recent Vehicles
                  </CardTitle>
                  <CardDescription>
                    Overview of your fleet with status and location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    {vehicles?.success === false ? (
                      <p>No Vehicles Added</p>
                    ) : (
                      <div className="grid gap-4">
                        {vehicles?.rows.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="flex gap-3 flex-wrap items-center justify-between rounded-lg border p-4"
                          >
                            <div className="grid gap-1">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {vehicle.category}
                                </span>
                              </div>
                              <div className="text-sm">
                                {/* @ts-ignore */}
                                Driver: {vehicle.owner.name}
                              </div>
                              <div className="text-sm">
                                {/* @ts-ignore */}
                                Plate Number: {vehicle.plate_number}
                              </div>
                              <div className="text-sm">
                                {/* @ts-ignore */}
                                T-CODE: {vehicle.t_code}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className=" rounded-full px-2.5 py-0.5 text-xs font-medium  bg-emerald-600/25 text-emerald-700 ">
                                  {vehicle.status}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {/* @ts-ignore */}
                                {vehicle.owner.address}
                              </div>
                            </div>
                            <RemoveVehicleFromCompany
                              className=" bg-primary text-[13px] px-[15px] py-[10px] text-white rounded-xl "
                              id={vehicle.id}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                {/* @ts-ignore */}
                {(vehicles?.meta.totalVehicles ||
                  vehicles?.success === false) <= 2 ? null : (
                  <CardFooter>
                    <Button variant="default" className="w-full" asChild>
                      <Link href={`/companies/${id}/vehicles`}>
                        View All Vehicles
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="shrink-0 grow-0 font-bold text-xl">
                    Recent Payments
                  </CardTitle>
                  <CardDescription>
                    Overview of recent financial transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      {
                        id: "INV-001",
                        client: "Acme Logistics",
                        amount: "$2,450.00",
                        status: "Paid",
                        date: "Mar 2, 2023",
                      },
                      {
                        id: "INV-002",
                        client: "Global Shipping Co.",
                        amount: "$1,890.00",
                        status: "Pending",
                        date: "Mar 4, 2023",
                      },
                      {
                        id: "INV-003",
                        client: "Metro Delivery Services",
                        amount: "$3,200.00",
                        status: "Paid",
                        date: "Mar 7, 2023",
                      },
                      {
                        id: "INV-004",
                        client: "FastTrack Couriers",
                        amount: "$1,100.00",
                        status: "Overdue",
                        date: "Feb 28, 2023",
                      },
                    ].map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="grid gap-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{payment.id}</span>
                          </div>
                          <div className="text-sm">{payment.client}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{payment.amount}</div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              payment.status === "Paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : payment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    View All Payments
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGateServer>
  );
}
