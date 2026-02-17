import { z } from "zod";

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// ──────────────────────────────────────────────
// Onboarding schema
// ──────────────────────────────────────────────

export const onboardingSchema = z.object({
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City name is too long"),
  lat: z
    .number({ required_error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number({ required_error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  radiusMiles: z
    .number({ required_error: "Radius is required" })
    .min(1, "Radius must be at least 1 mile")
    .max(50, "Radius must be at most 50 miles"),
  interests: z
    .array(z.string())
    .min(1, "Select at least one interest")
    .max(10, "You can select up to 10 interests"),
  kidsAgeRanges: z
    .array(z.string())
    .min(1, "Select at least one age range")
    .max(5, "You can select up to 5 age ranges"),
});

// ──────────────────────────────────────────────
// Create Event schema
// ──────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z
    .string()
    .min(6, "Title must be at least 6 characters")
    .max(80, "Title must be at most 80 characters")
    .trim(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(600, "Description must be at most 600 characters")
    .trim(),
  category: z
    .string()
    .min(1, "Category is required"),
  startAt: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((date) => date > new Date(), {
      message: "Event must be scheduled in the future",
    }),
  durationMins: z
    .number({ required_error: "Duration is required" })
    .int("Duration must be a whole number")
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration must be at most 8 hours"),
  indoorOutdoor: z.enum(["INDOOR", "OUTDOOR", "BOTH", "MIXED"], {
    required_error: "Please specify indoor or outdoor",
  }),
  ageMin: z
    .number({ required_error: "Minimum age is required" })
    .int("Age must be a whole number")
    .min(0, "Minimum age cannot be negative")
    .max(17, "Minimum age must be at most 17"),
  ageMax: z
    .number({ required_error: "Maximum age is required" })
    .int("Age must be a whole number")
    .min(0, "Maximum age cannot be negative")
    .max(17, "Maximum age must be at most 17"),
  maxAttendees: z
    .number({ required_error: "Max attendees is required" })
    .int("Attendees must be a whole number")
    .min(2, "Must allow at least 2 attendees")
    .max(50, "Cannot exceed 50 attendees"),
  noDevices: z.boolean().default(false),
  locationLabelPublic: z
    .string()
    .min(3, "Public location label must be at least 3 characters")
    .max(100, "Public location label must be at most 100 characters")
    .trim(),
  locationNotesPrivate: z
    .string()
    .max(300, "Private location notes must be at most 300 characters")
    .trim()
    .optional()
    .default(""),
  lat: z
    .number({ required_error: "Location latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number({ required_error: "Location longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

// ──────────────────────────────────────────────
// Report schema
// ──────────────────────────────────────────────

export const reportSchema = z.object({
  targetType: z.enum(["USER", "EVENT"], {
    required_error: "Report target type is required",
  }),
  targetId: z
    .string()
    .min(1, "Target ID is required"),
  reason: z.enum(["HARASSMENT", "HATE", "UNSAFE", "SPAM", "POLITICS", "OTHER"], {
    required_error: "Please select a reason",
  }),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .trim()
    .optional(),
});

// ──────────────────────────────────────────────
// Feedback schema
// ──────────────────────────────────────────────

export const feedbackSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .max(5, "You can select up to 5 tags")
    .default([]),
});

// ──────────────────────────────────────────────
// Help Request schema
// ──────────────────────────────────────────────

export const helpRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters")
    .transform((v) => v.toLowerCase().trim()),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be at most 100 characters")
    .trim(),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be at most 2000 characters")
    .trim(),
});

// ──────────────────────────────────────────────
// Inferred types
// ──────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type HelpRequestInput = z.infer<typeof helpRequestSchema>;
