import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  // Rwandan mobile: 10 digits starting 07, or +250 + 9 digits.
  phone: z
    .string()
    .trim()
    .regex(/^(\+?250)?0?7[2-9]\d{7}$/, "Valid Rwandan phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Customers and providers can self-register; admin cannot.
  role: z.enum(["customer", "provider"]).default("customer"),
  district: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
