import { z } from "zod";

export const addIPSchema = z.object({
  ip: z
    .string()
    .min(1, "IP address is required")
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Please enter a valid IP address"
    ),
});

export type AddIPFormData = z.infer<typeof addIPSchema>;
