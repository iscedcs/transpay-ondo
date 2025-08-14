"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, GripVertical, AlertTriangle } from "lucide-react"
import { STATE_CONFIG } from "@/lib/constants"
import { getAvailableVehicles } from "@/lib/routes-data"
import type { CreateRouteData, VehicleOption } from "@/types/routes"

const assignRouteSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
})

interface RouteStep {
  id: string
  lgaId: string
  lgaName: string
  order: number
}

interface AssignRouteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRouteData) => Promise<void>
}

export function AssignRouteModal({ isOpen, onClose, onSubmit }: AssignRouteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null)

  const form = useForm<{ vehicleId: string }>({
    resolver: zodResolver(assignRouteSchema),
    defaultValues: {
      vehicleId: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      loadVehicles()
    }
  }, [isOpen])

  const loadVehicles = async () => {
    try {
      const vehicleData = await getAvailableVehicles()
      setVehicles(vehicleData)
    } catch (error) {
      // TODO: Handle error (e.g., show toast)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    setSelectedVehicle(vehicle || null)
    form.setValue("vehicleId", vehicleId)
  }

  const addLGAStep = (lgaId: string) => {
    const lga = STATE_CONFIG.lgas.find((l) => l.id === lgaId)
    if (!lga) return

    // Check if LGA already exists in route
    if (routeSteps.some((step) => step.lgaId === lgaId)) {
      return
    }

    const newStep: RouteStep = {
      id: `step_${Date.now()}`,
      lgaId,
      lgaName: lga.name,
      order: routeSteps.length + 1,
    }

    setRouteSteps([...routeSteps, newStep])
  }

  const removeStep = (stepId: string) => {
    const updatedSteps = routeSteps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index + 1 }))
    setRouteSteps(updatedSteps)
  }

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const stepIndex = routeSteps.findIndex((step) => step.id === stepId)
    if (stepIndex === -1) return

    const newSteps = [...routeSteps]
    const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1

    if (targetIndex < 0 || targetIndex >= newSteps.length) return // Swap steps
    ;[newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]]

    // Update order numbers
    const reorderedSteps = newSteps.map((step, index) => ({ ...step, order: index + 1 }))
    setRouteSteps(reorderedSteps)
  }

  const handleSubmit = async (data: { vehicleId: string }) => {
    if (routeSteps.length === 0) {
      form.setError("root", { message: "Please add at least one LGA to the route" })
      return
    }

    setIsLoading(true)
    try {
      const routeData: CreateRouteData = {
        vehicleId: data.vehicleId,
        steps: routeSteps.map((step) => ({
          lgaId: step.lgaId,
          order: step.order,
        })),
      }

      await onSubmit(routeData)
      handleClose()
    } catch (error) {
      form.setError("root", { message: "Failed to create route. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setRouteSteps([])
    setSelectedVehicle(null)
    onClose()
  }

  const availableLGAs = STATE_CONFIG.lgas.filter((lga) => !routeSteps.some((step) => step.lgaId === lga.id))

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Vehicle Route</DialogTitle>
          <DialogDescription>
            Create a new route by selecting a vehicle and defining the LGA sequence.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Vehicle Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Vehicle</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleVehicleChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id} disabled={vehicle.hasRoute}>
                              <div className="flex items-center justify-between w-full">
                                <span>{vehicle.plateNumber}</span>
                                <span className="text-sm text-muted-foreground ml-2">{vehicle.owner}</span>
                                {vehicle.hasRoute && <Badge variant="secondary">Has Route</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedVehicle && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Selected Vehicle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Plate:</span>
                        <span>{selectedVehicle.plateNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Owner:</span>
                        <span>{selectedVehicle.owner}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline">{selectedVehicle.category}</Badge>
                      </div>
                      {selectedVehicle.hasRoute && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>This vehicle already has a route assigned.</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Add LGA to Route
                  </label>
                  <Select onValueChange={addLGAStep} value="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select an LGA to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLGAs.map((lga) => (
                        <SelectItem key={lga.id} value={lga.id}>
                          {lga.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column - Route Steps */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Route Sequence ({routeSteps.length} LGAs)
                  </label>
                  <p className="text-sm text-muted-foreground">Drag to reorder or use arrow buttons</p>
                </div>

                {routeSteps.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No LGAs added to route</p>
                    <p className="text-xs text-gray-500">Select LGAs from the dropdown to build the route</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {routeSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{step.order}</Badge>
                            <span className="font-medium">{step.lgaName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, "down")}
                            disabled={index === routeSteps.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || routeSteps.length === 0}>
                {isLoading ? "Creating..." : "Create Route"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
