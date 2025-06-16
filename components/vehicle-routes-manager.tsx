"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2, MapPin, Route } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/ui/sortable-item";
import {
  createVehicleRoute,
  getVehicleRoutes,
  reorderVehicleRoutes,
  deleteVehicleRoute,
  type VehicleRoute,
} from "@/actions/routes";
import { LGA, getLGAs } from "@/actions/lga";

interface VehicleRoutesManagerProps {
  vehicleId: string;
  initialRoutes?: VehicleRoute[];
}

export function VehicleRoutesManager({
  vehicleId,
  initialRoutes = [],
}: VehicleRoutesManagerProps) {
  const [routes, setRoutes] = useState<VehicleRoute[]>(initialRoutes);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    lgaId: "",
    order: routes.length + 1,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load routes and LGAs on component mount
  useEffect(() => {
    loadRoutes();
    loadLGAs();
  }, [vehicleId]);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const result = await getVehicleRoutes(vehicleId);
      if (result.success) {
        setRoutes(result.data);
      } else {
        toast.error("Failed to load routes", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error loading routes", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLGAs = async () => {
    try {
      const result = await getLGAs();
      if (result.success) {
        setLgas(result.data);
      }
    } catch (error) {
      console.error("Error loading LGAs:", error);
    }
  };

  const handleAddRoute = async () => {
    if (!newRoute.lgaId) {
      toast.error("Please select an LGA");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createVehicleRoute({
        vehicleId,
        lgaId: newRoute.lgaId,
        order: newRoute.order,
      });

      if (result.success) {
        toast.success("Route added successfully");
        setIsAddDialogOpen(false);
        setNewRoute({ lgaId: "", order: routes.length + 2 });
        await loadRoutes(); // Reload to get updated data
      } else {
        toast.error("Failed to add route", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error adding route", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routes.findIndex((route) => route.id === active.id);
      const newIndex = routes.findIndex((route) => route.id === over.id);

      const newRoutes = arrayMove(routes, oldIndex, newIndex);
      setRoutes(newRoutes);

      // Update order numbers and send to API
      const reorderData = newRoutes.map((route: any, index: number) => ({
        routeId: route.id,
        order: index + 1,
      }));

      try {
        const result = await reorderVehicleRoutes(reorderData);
        if (result.success) {
          toast.success("Routes reordered successfully");
        } else {
          toast.error("Failed to reorder routes", {
            description: result.message,
          });
          // Revert on failure
          await loadRoutes();
        }
      } catch (error) {
        toast.error("Error reordering routes");
        // Revert on failure
        await loadRoutes();
      }
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteVehicleRoute(routeId);
      if (result.success) {
        toast.success("Route deleted successfully");
        await loadRoutes();
      } else {
        toast.error("Failed to delete route", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error deleting route");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Vehicle Routes
        </CardTitle>
        <CardDescription>
          Manage the sequence of LGAs this vehicle travels through
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No routes configured for this vehicle
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Route
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Route</DialogTitle>
                  <DialogDescription>
                    Add an LGA to this vehicle's route sequence
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA</Label>
                    <Select
                      value={newRoute.lgaId}
                      onValueChange={(value) =>
                        setNewRoute({ ...newRoute, lgaId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {lgas.map((lga) => (
                          <SelectItem key={lga.id} value={lga.id}>
                            {lga.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={newRoute.order}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          order: Number.parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoute} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Route"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{routes.length} Routes</Badge>
                <span className="text-sm text-muted-foreground">
                  Drag to reorder
                </span>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Route</DialogTitle>
                    <DialogDescription>
                      Add an LGA to this vehicle's route sequence
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lga">LGA</Label>
                      <Select
                        value={newRoute.lgaId}
                        onValueChange={(value) =>
                          setNewRoute({ ...newRoute, lgaId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an LGA" />
                        </SelectTrigger>
                        <SelectContent>
                          {lgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.id}>
                              {lga.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        min="1"
                        value={newRoute.order}
                        onChange={(e) =>
                          setNewRoute({
                            ...newRoute,
                            order: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddRoute} disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Route"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={routes.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {routes.map((route, index) => (
                    <SortableItem key={route.id} id={route.id}>
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Badge className="min-w-[2rem] justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{route.lga.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Added{" "}
                            {new Date(route.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Route</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {route.lga.name}{" "}
                                from this vehicle's route? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRoute(route.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </CardContent>
    </Card>
  );
}
