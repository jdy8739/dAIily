import { z } from "zod";

const ExperienceLevel = z.enum([
  "INTERN",
  "JUNIOR",
  "MID_LEVEL",
  "SENIOR",
  "LEAD",
  "MANAGER",
  "DIRECTOR",
  "VP",
  "C_LEVEL",
]);

export const updateProfileSchema = z.object({
  // Basic Information
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  // Career Information
  currentRole: z
    .string()
    .max(100, "Role must be less than 100 characters")
    .optional(),
  experienceLevel: ExperienceLevel.optional(),
  industry: z
    .string()
    .max(100, "Industry must be less than 100 characters")
    .optional(),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience seems too high")
    .optional(),

  // Skills (comma-separated strings that will be converted to arrays)
  currentSkills: z.string().max(1000, "Skills list too long").optional(),
  targetSkills: z.string().max(1000, "Skills list too long").optional(),

  // Goals (comma-separated strings that will be converted to arrays)
  currentGoals: z.string().max(1000, "Goals list too long").optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export { ExperienceLevel };
