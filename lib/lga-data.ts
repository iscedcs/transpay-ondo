import type {
  LGA,
  LGAAgent,
  LGAVehicle,
  LGAScan,
  LGARoute,
  LGAFilters,
  CreateLGAData,
} from "@/types/lga";
import type { NigeriaLGAFeature } from "@/lib/nigeria-lgas";
import { getStateName, calculateLGACenter } from "@/lib/nigeria-lgas";

// Mock data - replace with actual database queries
export async function getLGAs(filters: LGAFilters = {}): Promise<{
  lgas: LGA[];
  total: number;
  page: number;
  pageSize: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const mockLGAs: any[] = [
    {
      id: "lga_lagos_mainland",
      name: "Lagos Mainland",
      state: "Lagos State",
      stateId: "LA",
      stateCode: "LA",
      fee: 500,
      boundary: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [
                [3.3792, 6.5244],
                [3.3795, 6.525],
                [3.3789, 6.5255],
                [3.3792, 6.5244],
              ],
            ],
          ],
        ],
        source: "nigeria-official" as const,
        lgaCode: "LA001",
        stateCode: "LA",
      },
      createdAt: new Date("2025-01-20T10:15:00Z"),
      updatedAt: new Date("2025-01-22T08:00:00Z"),
      agentCount: 15,
      vehicleCount: 2340,
      scanCount: 1250,
      lgaCode: "LA001",
      officialId: 28001,
    },
    {
      id: "lga_ikeja",
      name: "Ikeja",
      state: "Lagos State",
      stateId: "LA",
      stateCode: "LA",
      fee: 600,
      boundary: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [
                [3.34, 6.6],
                [3.35, 6.61],
                [3.33, 6.62],
                [3.34, 6.6],
              ],
            ],
          ],
        ],
        source: "nigeria-official" as const,
        lgaCode: "LA002",
        stateCode: "LA",
      },
      createdAt: new Date("2025-01-15T14:30:00Z"),
      updatedAt: new Date("2025-01-20T16:45:00Z"),
      agentCount: 22,
      vehicleCount: 3120,
      scanCount: 1890,
      lgaCode: "LA002",
      officialId: 28002,
    },
    {
      id: "lga_victoria_island",
      name: "Victoria Island",
      state: "Lagos State",
      stateId: "LA",
      stateCode: "LA",
      fee: 800,
      boundary: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [
                [3.42, 6.43],
                [3.43, 6.44],
                [3.41, 6.45],
                [3.42, 6.43],
              ],
            ],
          ],
        ],
        source: "nigeria-official" as const,
        lgaCode: "LA003",
        stateCode: "LA",
      },
      createdAt: new Date("2025-01-10T09:20:00Z"),
      updatedAt: new Date("2025-01-25T11:15:00Z"),
      agentCount: 18,
      vehicleCount: 1890,
      scanCount: 980,
      lgaCode: "LA003",
      officialId: 28003,
    },
  ];

  let filteredLGAs = mockLGAs;

  if (filters.stateId || filters.stateCode) {
    const stateFilter = filters.stateId || filters.stateCode;
    filteredLGAs = filteredLGAs.filter(
      (lga) => lga.stateId === stateFilter || lga.stateCode === stateFilter
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredLGAs = filteredLGAs.filter((lga) =>
      lga.name.toLowerCase().includes(searchLower)
    );
  }

  return {
    lgas: filteredLGAs,
    total: filteredLGAs.length,
    page: 1,
    pageSize: 10,
  };
}

export async function getLGAById(id: string): Promise<LGA | null> {
  const { lgas } = await getLGAs();
  return lgas.find((lga) => lga.id === id) || null;
}

export async function getLGAAgents(lgaId: string): Promise<LGAAgent[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      id: "agent_1",
      name: "John Agent",
      email: "john.agent@transpay.gov.ng",
      phone: "+234-801-234-5678",
      status: "active",
      assignedAt: new Date("2025-01-15T10:00:00Z"),
    },
    {
      id: "agent_2",
      name: "Jane Compliance",
      email: "jane.compliance@transpay.gov.ng",
      phone: "+234-802-345-6789",
      status: "active",
      assignedAt: new Date("2025-01-10T14:30:00Z"),
    },
  ];
}

export async function getLGAVehicles(lgaId: string): Promise<LGAVehicle[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      id: "vehicle_1",
      plateNumber: "LAG-123-ABC",
      category: "taxi",
      ownerName: "David Owner",
      status: "compliant",
      lastPayment: new Date("2025-01-20T00:00:00Z"),
      registeredAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
      id: "vehicle_2",
      plateNumber: "LAG-456-DEF",
      category: "bus",
      ownerName: "Sarah Transport",
      status: "non_compliant",
      registeredAt: new Date("2024-12-15T00:00:00Z"),
    },
  ];
}

export async function getLGAScans(lgaId: string): Promise<LGAScan[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      id: "scan_1",
      agentId: "agent_1",
      agentName: "John Agent",
      vehicleId: "vehicle_1",
      plateNumber: "LAG-123-ABC",
      scanType: "compliance",
      result: "compliant",
      timestamp: new Date("2025-01-25T10:30:00Z"),
      location: { lat: 6.5244, lng: 3.3792 },
    },
    {
      id: "scan_2",
      agentId: "agent_2",
      agentName: "Jane Compliance",
      vehicleId: "vehicle_2",
      plateNumber: "LAG-456-DEF",
      scanType: "compliance",
      result: "violation",
      timestamp: new Date("2025-01-25T14:15:00Z"),
      location: { lat: 6.525, lng: 3.3795 },
    },
  ];
}

export async function getLGARoutes(lgaId: string): Promise<LGARoute[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      id: "route_1",
      name: "Main Street Route",
      startPoint: "Lagos Mainland Terminal",
      endPoint: "Victoria Island",
      distance: 15.5,
      vehicleTypes: ["bus", "taxi"],
      status: "active",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
      id: "route_2",
      name: "Commercial District",
      startPoint: "Ikeja GRA",
      endPoint: "Computer Village",
      distance: 8.2,
      vehicleTypes: ["taxi", "tricycle"],
      status: "active",
      createdAt: new Date("2025-01-05T00:00:00Z"),
    },
  ];
}

export async function createLGA(data: CreateLGAData): Promise<LGA> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newLGA: LGA = {
    id: `lga_${Date.now()}`,
    name: data.name,
    state: getStateName(data.stateCode as any) || "Unknown State",
    stateId: data.stateId,
    stateCode: data.stateCode,
    fee: data.fee,
    boundary: data.boundary,
    createdAt: new Date().toTimeString(),
    updatedAt: new Date().toTimeString(),
    deletedAt: new Date().toTimeString(),
    agentCount: 0,
    vehicleCount: 0,
    scanCount: 0,
    lgaCode: data.stateCode + String(Date.now()).slice(-3),
    officialId: data.officialLGAId,
  };

  return newLGA;
}

export async function updateLGA(
  id: string,
  data: Partial<CreateLGAData>
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function deleteLGA(id: string, hard = false): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// New function to import LGAs from Nigerian official data
export async function importLGAsFromNigerianData(
  features: NigeriaLGAFeature[],
  defaultFee: number
): Promise<LGA[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const importedLGAs: any[] = features.map((feature) => {
    const center = calculateLGACenter(feature.geometry.coordinates);

    return {
      id: `lga_${feature.properties.code}`,
      name: feature.properties.name,
      state:
        getStateName(feature.properties.state_code as any) || "Unknown State",
      stateId: feature.properties.state_code,
      stateCode: feature.properties.state_code,
      fee: defaultFee,
      boundary: {
        type: "MultiPolygon",
        coordinates: feature.geometry.coordinates,
        source: "nigeria-official" as const,
        lgaCode: feature.properties.code,
        stateCode: feature.properties.state_code,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      agentCount: 0,
      vehicleCount: 0,
      scanCount: 0,
      lgaCode: feature.properties.code,
      officialId: feature.properties.id,
    };
  });

  return importedLGAs;
}
