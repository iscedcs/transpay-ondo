import type { SystemUser, UserFilters } from "@/types/users"

// Mock data - replace with actual database queries
export async function getUsers(filters: UserFilters = {}): Promise<{
  users: SystemUser[]
  total: number
  page: number
  pageSize: number
}> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockUsers: SystemUser[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@transpay.gov.ng",
      phone: "+234-801-234-5678",
      role: "admin",
      stateId: "1",
      stateName: "Lagos State",
      lgaId: "1",
      lgaName: "Ikeja",
      status: "active",
      lastLogin: new Date("2024-01-15T10:30:00"),
      createdAt: new Date("2024-01-01T00:00:00"),
      createdBy: "system",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@transpay.gov.ng",
      phone: "+234-802-345-6789",
      role: "lga_admin",
      stateId: "1",
      stateName: "Lagos State",
      lgaId: "2",
      lgaName: "Lagos Island",
      status: "active",
      lastLogin: new Date("2024-01-14T15:45:00"),
      createdAt: new Date("2024-01-02T00:00:00"),
      createdBy: "1",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@transpay.gov.ng",
      phone: "+234-803-456-7890",
      role: "lga_agent",
      stateId: "1",
      stateName: "Lagos State",
      lgaId: "1",
      lgaName: "Ikeja",
      status: "active",
      lastLogin: new Date("2024-01-15T09:15:00"),
      createdAt: new Date("2024-01-03T00:00:00"),
      createdBy: "2",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@transpay.gov.ng",
      phone: "+234-804-567-8901",
      role: "lga_compliance",
      stateId: "1",
      stateName: "Lagos State",
      lgaId: "3",
      lgaName: "Victoria Island",
      status: "suspended",
      lastLogin: new Date("2024-01-10T14:20:00"),
      createdAt: new Date("2024-01-04T00:00:00"),
      createdBy: "1",
    },
    {
      id: "5",
      name: "David Brown",
      email: "david.brown@gmail.com",
      phone: "+234-805-678-9012",
      role: "vehicle_owner",
      stateId: "1",
      stateName: "Lagos State",
      lgaId: "4",
      lgaName: "Surulere",
      status: "pending",
      lastLogin: undefined,
      createdAt: new Date("2024-01-15T00:00:00"),
      createdBy: "3",
    },
  ]

  // Apply filters
  let filteredUsers = mockUsers

  if (filters.role) {
    filteredUsers = filteredUsers.filter((user) => user.role === filters.role)
  }

  if (filters.stateId) {
    filteredUsers = filteredUsers.filter((user) => user.stateId === filters.stateId)
  }

  if (filters.lgaId) {
    filteredUsers = filteredUsers.filter((user) => user.lgaId === filters.lgaId)
  }

  if (filters.status) {
    filteredUsers = filteredUsers.filter((user) => user.status === filters.status)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower),
    )
  }

  return {
    users: filteredUsers,
    total: filteredUsers.length,
    page: 1,
    pageSize: 10,
  }
}

export async function getUserById(id: string): Promise<SystemUser | null> {
  const { users } = await getUsers()
  return users.find((user) => user.id === id) || null
}

export async function createUser(userData: any): Promise<SystemUser> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newUser: SystemUser = {
    id: Date.now().toString(),
    ...userData,
    status: "pending" as const,
    createdAt: new Date(),
    createdBy: "current-user-id",
  }

  return newUser
}

export async function updateUserStatus(userId: string, status: SystemUser["status"]): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
}
