import { z } from "zod";

export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const normalizeName = (value = "") => value.trim().replace(/\s+/g, " ");

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .refine((value) => !/\s/.test(value), { message: "Email must not contain spaces" })
  .email({ message: "Invalid email format" });

export const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(15, { message: "Password must be at most 15 characters" })
  .refine((value) => !/\s/.test(value), { message: "Password must not contain spaces" });

export const nameSchema = (label) =>
  z
    .string()
    .trim()
    .min(2, { message: `${label} must be at least 2 characters long` })
    .max(15, { message: `${label} must be at most 15 characters` })
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
      message: `${label} must contain only English letters and single spaces`,
    });
