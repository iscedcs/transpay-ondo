"use client";

import { Badge } from "@/components/ui/badge";
import {
     Card,
     CardContent,
     CardDescription,
     CardHeader,
     CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
     Activity,
     Bus,
     Car,
     CreditCard,
     Currency,
     DollarSign,
     TrendingDown,
     TrendingUp,
     Truck,
} from "lucide-react";
import {
     CartesianGrid,
     Cell,
     Legend,
     Line,
     LineChart,
     Pie,
     PieChart,
     ResponsiveContainer,
     Tooltip,
     XAxis,
     YAxis,
} from "recharts";

// Mock data
const revenueData = [
     { month: "Jan", revenue: 1200000 },
     { month: "Feb", revenue: 1350000 },
     { month: "Mar", revenue: 1500000 },
     { month: "Apr", revenue: 1400000 },
     { month: "May", revenue: 1600000 },
     { month: "Jun", revenue: 1800000 },
];

const vehicleTypeData = [
     { name: "Cars", value: 4500 },
     { name: "Trucks", value: 2300 },
     { name: "Buses", value: 1800 },
     { name: "Others", value: 900 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsPage() {
     const totalRevenue = revenueData.reduce(
          (sum, item) => sum + item.revenue,
          0,
     );
     const lastMonthRevenue = revenueData[revenueData.length - 1].revenue;
     const previousMonthRevenue = revenueData[revenueData.length - 2].revenue;
     const revenueGrowth =
          ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
          100;

     return (
          <div className="bg-background p-6">
               <h1 className="mb-6 text-3xl font-bold">
                    Anambra State Levy Collection Analytics
               </h1>

               <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                   Total Revenue
                              </CardTitle>
                              <Currency className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">
                                   ₦{totalRevenue.toLocaleString()}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                   +{revenueGrowth.toFixed(2)}% from last month
                              </p>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                   Vehicles Charged
                              </CardTitle>
                              <Car className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">
                                   {vehicleTypeData.reduce(
                                        (sum, item) => sum + item.value,
                                        0,
                                   )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                   Active vehicles on the road
                              </p>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                   Collection Rate
                              </CardTitle>
                              <Activity className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">92%</div>
                              <Progress value={92} className="mt-2" />
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                   Uncollected Levies
                              </CardTitle>
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
                         <CardContent>
                              <div className="text-2xl font-bold">₦120,000</div>
                              <p className="text-xs text-muted-foreground">
                                   From inactive vehicles
                              </p>
                         </CardContent>
                    </Card>
               </div>

               <div className="mb-6 grid gap-6 md:grid-cols-2">
                    <Card>
                         <CardHeader>
                              <CardTitle>Revenue Trend</CardTitle>
                              <CardDescription>
                                   Monthly revenue from levy collection
                              </CardDescription>
                         </CardHeader>
                         <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                   <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                             type="monotone"
                                             dataKey="revenue"
                                             stroke="#8884d8"
                                             activeDot={{ r: 8 }}
                                        />
                                   </LineChart>
                              </ResponsiveContainer>
                         </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                              <CardTitle>Vehicle Type Distribution</CardTitle>
                              <CardDescription>
                                   Breakdown of charged vehicles by type
                              </CardDescription>
                         </CardHeader>
                         <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                   <PieChart>
                                        <Pie
                                             data={vehicleTypeData}
                                             cx="50%"
                                             cy="50%"
                                             labelLine={false}
                                             outerRadius={80}
                                             fill="#8884d8"
                                             dataKey="value"
                                        >
                                             {vehicleTypeData.map(
                                                  (entry, index) => (
                                                       <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                 COLORS[
                                                                      index %
                                                                           COLORS.length
                                                                 ]
                                                            }
                                                       />
                                                  ),
                                             )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                   </PieChart>
                              </ResponsiveContainer>
                         </CardContent>
                    </Card>
               </div>

               <Card>
                    <CardHeader>
                         <CardTitle>Levy Collection Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="overview">
                              <TabsList className="mb-4">
                                   <TabsTrigger value="overview">
                                        Overview
                                   </TabsTrigger>
                                   <TabsTrigger value="by-region">
                                        By Region
                                   </TabsTrigger>
                                   <TabsTrigger value="by-vehicle">
                                        By Vehicle Type
                                   </TabsTrigger>
                              </TabsList>
                              <TabsContent value="overview">
                                   <div className="space-y-4">
                                        <div className="flex items-center">
                                             <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                                             <span>
                                                  Overall collection efficiency
                                                  has improved by 5% compared to
                                                  last quarter
                                             </span>
                                        </div>
                                        <div className="flex items-center">
                                             <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                                             <span>
                                                  8% of vehicles were not
                                                  charged due to inactivity
                                             </span>
                                        </div>
                                        <div className="flex items-center">
                                             <Badge variant="outline">
                                                  New Policy
                                             </Badge>
                                             <span className="ml-2">
                                                  Electronic tagging system to
                                                  be implemented next month for
                                                  better tracking
                                             </span>
                                        </div>
                                   </div>
                              </TabsContent>
                              <TabsContent value="by-region">
                                   <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                             <span>Awka</span>
                                             <Progress
                                                  value={75}
                                                  className="w-1/2"
                                             />
                                             <span>75%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                             <span>Onitsha</span>
                                             <Progress
                                                  value={88}
                                                  className="w-1/2"
                                             />
                                             <span>88%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                             <span>Nnewi</span>
                                             <Progress
                                                  value={62}
                                                  className="w-1/2"
                                             />
                                             <span>62%</span>
                                        </div>
                                   </div>
                              </TabsContent>
                              <TabsContent value="by-vehicle">
                                   <div className="space-y-4">
                                        <div className="flex items-center">
                                             <Car className="mr-2 h-4 w-4" />
                                             <span>
                                                  Cars: 45% of total revenue
                                             </span>
                                        </div>
                                        <div className="flex items-center">
                                             <Truck className="mr-2 h-4 w-4" />
                                             <span>
                                                  Trucks: 30% of total revenue
                                             </span>
                                        </div>
                                        <div className="flex items-center">
                                             <Bus className="mr-2 h-4 w-4" />
                                             <span>
                                                  Buses: 20% of total revenue
                                             </span>
                                        </div>
                                        <div className="flex items-center">
                                             <span className="mr-2">🏍️</span>
                                             <span>
                                                  Others: 5% of total revenue
                                             </span>
                                        </div>
                                   </div>
                              </TabsContent>
                         </Tabs>
                    </CardContent>
               </Card>
          </div>
     );
}
