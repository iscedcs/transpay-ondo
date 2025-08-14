"use client";

import { getFullVehicleById } from "@/actions/vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function VehicleWalletPage({ 
     params 
}: PageProps) {
     const router = useRouter();
     const { data: session, status } = useSession();
     const [wallet, setWallet] = useState<IWallet | null>(null);
     const [vehicle, setVehicle] = useState<IVehicle | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (status === "unauthenticated") {
               router.push("/login");
          } else if (session?.user?.role !== Role.SUPERADMIN) {
               // router.push("/unauthorized");
          } else {
               fetchWalletData();
          }
     }, [status, session, router, params]);

     const fetchWalletData = async () => {
       try {
         const response = await fetch(`/api/vehicle-wallet/${params}`);
         const currentVehicle = await getFullVehicleById((await params).id);
         if (!response.ok) throw new Error("Failed to fetch wallet data");
         const data = await response.json();
         setWallet(data);
         // @ts-expect-error
         setVehicle(currentVehicle?.success?.data.vehicle);
       } catch (error) {
         toast({
           title: "Error",
           description: "Failed to fetch wallet data. Please try again.",
           variant: "destructive",
         });
       } finally {
         setLoading(false);
       }
     };

     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
       setLoading(true);
       try {
         const response = await fetch(
           `/api/vehicle-wallet/${(await params).id}`,
           {
             method: "PUT",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(wallet),
           }
         );
         if (!response.ok) throw new Error("Failed to update wallet");
         toast({
           title: "Success",
           description: "Vehicle wallet updated successfully.",
         });
       } catch (error) {
         toast({
           title: "Error",
           description: "Failed to update wallet. Please try again.",
           variant: "destructive",
         });
       } finally {
         setLoading(false);
       }
     };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          // @ts-expect-error
          setWallet((prev: IWallet | null) => ({ ...prev, [name]: parseFloat(value) || 0 }));
     };

     if (loading) return <div>Loading...</div>;
     if (!wallet) return <div>Wallet not found</div>;

     return (
          <Card className="mx-auto w-full max-w-2xl">
               <CardHeader>
                    <CardTitle>Update Vehicle Wallet For {vehicle?.tCode}</CardTitle>
                    <CardDescription></CardDescription>
               </CardHeader>
               <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                   <Label htmlFor="cvof_balance">CVOF Balance</Label>
                                   <Input id="cvof_balance" name="cvof_balance" type="number" value={wallet.cvof_balance} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="cvof_owing">CVOF Owing</Label>
                                   <Input id="cvof_owing" name="cvof_owing" type="number" value={wallet.cvof_owing} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="fareflex_balance">Fareflex Balance</Label>
                                   <Input id="fareflex_balance" name="fareflex_balance" type="number" value={wallet.fareflex_balance} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="fareflex_owing">Fareflex Owing</Label>
                                   <Input id="fareflex_owing" name="fareflex_owing" type="number" value={wallet.fareflex_owing} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="isce_balance">Sticker Balance</Label>
                                   <Input id="isce_balance" name="isce_balance" type="number" value={wallet.isce_balance} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="isce_owing">Sticker Owing</Label>
                                   <Input id="isce_owing" name="isce_owing" type="number" value={wallet.isce_owing} onChange={handleInputChange} required />
                              </div>
                              {/* 
                              <div>
                                   <Label htmlFor="wallet_balance">Wallet Balance</Label>
                                   <Input id="wallet_balance" name="wallet_balance" type="number" value={wallet.wallet_balance} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="amount_owed">Amount Owed</Label>
                                   <Input id="amount_owed" name="amount_owed" type="number" value={wallet.amount_owed} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="net_total">Net Total</Label>
                                   <Input id="net_total" name="net_total" type="number" value={wallet.net_total} onChange={handleInputChange} required />
                              </div>
                              <div>
                                   <Label htmlFor="next_transaction_date">Next Transaction Date</Label>
                                   <Input
                                        id="next_transaction_date"
                                        name="next_transaction_date"
                                        type="date"
                                        value={wallet.next_transaction_date.split("T")[0]}
                                        onChange={handleInputChange}
                                        required
                                   />
                              </div> */}
                         </div>
                         <Button type="submit" disabled={loading}>
                              {loading ? "Updating..." : "Update Wallet"}
                         </Button>
                    </form>
               </CardContent>
          </Card>
     );
}
