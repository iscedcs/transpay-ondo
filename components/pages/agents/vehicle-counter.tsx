import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// interface Vehicle {
//      type: string;
//      count: number;
// }

// interface VehicleCounterProps {
//      vehicles?: Vehicle[];
// }

// const getVehicleIcon = (type: string) => {
//      switch (type.toLowerCase()) {
//           case "car":
//                return <Car className="h-4 w-4" />;
//           case "truck":
//                return <Truck className="h-4 w-4" />;
//           case "MOTOR_CYCLE":
//                return <Bike className="h-4 w-4" />;
//           default:
//                return null;
//      }
// };

export default function VehicleCounter({ count }: { count?: number }) {
     // const totalVehicles = vehicles.reduce(
     //      (sum, vehicle) => sum + vehicle.count,
     //      0,
     // );

     return (
          <Card className="w-full max-w-md">
               <CardHeader>
                    <CardTitle className="text-2xl font-bold">Vehicle Count</CardTitle>
                    <p className="text-sm text-muted-foreground">Total Vehicles Registered: {count}</p>
               </CardHeader>
               {/* <CardContent>
                    {vehicles.length > 0 ? (
                         <div className="space-y-2">
                              {vehicles.map((vehicle) => (
                                   <div
                                        key={vehicle.type}
                                        className="flex items-center justify-between"
                                   >
                                        <div className="flex items-center space-x-2">
                                             {getVehicleIcon(vehicle.type)}
                                             <span>{vehicle.type}</span>
                                        </div>
                                        <Badge variant="secondary">
                                             {vehicle.count}
                                        </Badge>
                                   </div>
                              ))}
                         </div>
                    ) : (
                         <p className="text-muted-foreground">
                              No vehicles registered.
                         </p>
                    )}
               </CardContent> */}
          </Card>
     );
}
