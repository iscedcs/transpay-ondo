import type { VehicleRoute, RouteStep, CreateRouteData, RouteFilters, VehicleOption } from "@/types/routes"
import { STATE_CONFIG } from "@/lib/constants"

// Mock data - replace with actual database queries
export async function getVehicleRoutes(filters: RouteFilters = {}): Promise<{
  routes: VehicleRoute[]
  total: number
  page: number
  pageSize: number
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockRoutes: VehicleRoute[] = [
    {
      id: "route_001",
      vehicleId: "vehicle_001",
      vehiclePlate: "LAG-123-ABC",
      vehicleOwner: "Lagos Transport Co.",
      vehicleCategory: "bus",
      stateId: "1",
      stateName: "Lagos State",
      steps: [
        {
          id: "step_001",
          routeId: "route_001",
          lgaId: "1",
          lgaName: "Ikeja",
          order: 1,
          createdAt: new Date("2025-01-20T10:00:00Z"),
        },
        {
          id: "step_002",
          routeId: "route_001",
          lgaId: "2",
          lgaName: "Lagos Island",
          order: 2,
          createdAt: new Date("2025-01-20T10:00:00Z"),
        },
        {
          id: "step_003",
          routeId: "route_001",
          lgaId: "3",
          lgaName: "Victoria Island",
          order: 3,
          createdAt: new Date("2025-01-20T10:00:00Z"),
        },
      ],
      totalLGAs: 3,
      createdAt: new Date("2025-01-20T10:00:00Z"),
      updatedAt: new Date("2025-01-22T14:30:00Z"),
      createdBy: "admin_001",
    },
    {
      id: "route_002",
      vehicleId: "vehicle_002",
      vehiclePlate: "LAG-456-DEF",
      vehicleOwner: "Metro Bus Services",
      vehicleCategory: "bus",
      stateId: "1",
      stateName: "Lagos State",
      steps: [
        {
          id: "step_004",
          routeId: "route_002",
          lgaId: "4",
          lgaName: "Surulere",
          order: 1,
          createdAt: new Date("2025-01-18T09:15:00Z"),
        },
        {
          id: "step_005",
          routeId: "route_002",
          lgaId: "1",
          lgaName: "Ikeja",
          order: 2,
          createdAt: new Date("2025-01-18T09:15:00Z"),
        },
        {
          id: "step_006",
          routeId: "route_002",
          lgaId: "5",
          lgaName: "Alimosho",
          order: 3,
          createdAt: new Date("2025-01-18T09:15:00Z"),
        },
        {
          id: "step_007",
          routeId: "route_002",
          lgaId: "2",
          lgaName: "Lagos Island",
          order: 4,
          createdAt: new Date("2025-01-18T09:15:00Z"),
        },
      ],
      totalLGAs: 4,
      createdAt: new Date("2025-01-18T09:15:00Z"),
      updatedAt: new Date("2025-01-20T16:45:00Z"),
      createdBy: "admin_002",
    },
    {
      id: "route_003",
      vehicleId: "vehicle_003",
      vehiclePlate: "LAG-789-GHI",
      vehicleOwner: "City Taxi Ltd",
      vehicleCategory: "taxi",
      stateId: "1",
      stateName: "Lagos State",
      steps: [
        {
          id: "step_008",
          routeId: "route_003",
          lgaId: "3",
          lgaName: "Victoria Island",
          order: 1,
          createdAt: new Date("2025-01-15T14:20:00Z"),
        },
        {
          id: "step_009",
          routeId: "route_003",
          lgaId: "2",
          lgaName: "Lagos Island",
          order: 2,
          createdAt: new Date("2025-01-15T14:20:00Z"),
        },
      ],
      totalLGAs: 2,
      createdAt: new Date("2025-01-15T14:20:00Z"),
      updatedAt: new Date("2025-01-15T14:20:00Z"),
      createdBy: "lga_admin_001",
    },
  ]

  let filteredRoutes = mockRoutes

  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredRoutes = filteredRoutes.filter(
      (route) =>
        route.vehiclePlate.toLowerCase().includes(searchLower) ||
        route.vehicleOwner.toLowerCase().includes(searchLower) ||
        route.id.toLowerCase().includes(searchLower),
    )
  }

  if (filters.stateId) {
    filteredRoutes = filteredRoutes.filter((route) => route.stateId === filters.stateId)
  }

  if (filters.lgaId) {
    filteredRoutes = filteredRoutes.filter((route) => route.steps.some((step) => step.lgaId === filters.lgaId))
  }

  return {
    routes: filteredRoutes,
    total: filteredRoutes.length,
    page: 1,
    pageSize: 10,
  }
}

export async function getVehicleRouteById(routeId: string): Promise<VehicleRoute | null> {
  const { routes } = await getVehicleRoutes()
  return routes.find((route) => route.id === routeId) || null
}

export async function getVehicleRouteByVehicleId(vehicleId: string): Promise<VehicleRoute | null> {
  const { routes } = await getVehicleRoutes()
  return routes.find((route) => route.vehicleId === vehicleId) || null
}

export async function getAvailableVehicles(): Promise<VehicleOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return [
    {
      id: "vehicle_004",
      plateNumber: "LAG-111-JKL",
      owner: "Express Transport",
      category: "bus",
      stateId: "1",
      lgaId: "1",
      hasRoute: false,
    },
    {
      id: "vehicle_005",
      plateNumber: "LAG-222-MNO",
      owner: "Quick Taxi",
      category: "taxi",
      stateId: "1",
      lgaId: "2",
      hasRoute: false,
    },
    {
      id: "vehicle_006",
      plateNumber: "LAG-333-PQR",
      owner: "Cargo Express",
      category: "truck",
      stateId: "1",
      lgaId: "3",
      hasRoute: false,
    },
  ]
}

export async function createVehicleRoute(data: CreateRouteData): Promise<VehicleRoute> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newRoute: VehicleRoute = {
    id: `route_${Date.now()}`,
    vehicleId: data.vehicleId,
    vehiclePlate: "LAG-NEW-VEH", // Would be fetched from vehicle data
    vehicleOwner: "New Owner",
    vehicleCategory: "bus",
    stateId: "1",
    stateName: "Lagos State",
    steps: data.steps.map((step, index) => ({
      id: `step_${Date.now()}_${index}`,
      routeId: `route_${Date.now()}`,
      lgaId: step.lgaId,
      lgaName: STATE_CONFIG.lgas.find((lga) => lga.id === step.lgaId)?.name || "Unknown LGA",
      order: step.order,
      createdAt: new Date(),
    })),
    totalLGAs: data.steps.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "current-user-id",
  }

  return newRoute
}

export async function updateVehicleRoute(routeId: string, steps: RouteStep[]): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function deleteVehicleRoute(routeId: string, hard = false): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function getRoutesForLGA(lgaId: string): Promise<VehicleRoute[]> {
  const { routes } = await getVehicleRoutes()
  return routes.filter((route) => route.steps.some((step) => step.lgaId === lgaId))
}
