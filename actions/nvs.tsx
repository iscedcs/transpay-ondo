export async function fetchUserByNIN(nin: string): Promise<any | null> {
  try {
    // This is a mock implementation - in a real app, you would call an actual NIN verification API
    // For demo purposes, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate API call failure sometimes to show error handling
    if (Math.random() > 0.7) {
      throw new Error("NIN verification service temporarily unavailable");
    }

    // Mock data - in a real app, this would come from the NIN verification API
    if (nin === "12345678901") {
      return {
        id: "",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "08012345678",
        role: "VEHICLE_OWNER",
        address: JSON.stringify({
          STREET: "123 Main Street",
          UNIT: "Apt 4B",
          CITY: "Lagos",
          STATE: "Lagos",
          POSTAL_CODE: "100001",
          COUNTRY: "Nigeria",
          LGA: "Lagos Mainland",
        }),
        identification: "NIN",
        blacklisted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    }

    // For any other NIN, return null to indicate no user found
    return null;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to verify NIN"
    );
  }
}
