import { z } from "zod";

export const SHARED_PACKAGE_VERSION = "0.0.0";
export const PROPERTY_TIME_ZONE = "America/Sao_Paulo";

export const LOCALES = ["pt", "en", "es"] as const;
export const CURRENCIES = ["BRL", "USD", "EUR"] as const;
export const ROOM_TYPE_SLUGS = ["single", "double", "group"] as const;
export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "NO_SHOW",
] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const localeSchema = z.enum(LOCALES);
export const currencySchema = z.enum(CURRENCIES);
export const roomTypeSlugSchema = z.enum(ROOM_TYPE_SLUGS);
export const reservationStatusSchema = z.enum(RESERVATION_STATUSES);

export const localizedTextSchema = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
  es: z.string().min(1),
});

export function toDateOnly(value: string): Date {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  const yearText = match[1];
  const monthText = match[2];
  const dayText = match[3];
  if (!yearText || !monthText || !dayText) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toPropertyIsoDateOnly(
  date: Date = new Date(),
  timeZone = PROPERTY_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date for time zone: ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function differenceInNights(checkIn: string, checkOut: string): number {
  const start = toDateOnly(checkIn).getTime();
  const end = toDateOnly(checkOut).getTime();

  return Math.round((end - start) / MS_PER_DAY);
}

function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const date = toDateOnly(value);
  return toIsoDateOnly(date) === value;
}

function todayDateOnly(): Date {
  return toDateOnly(toPropertyIsoDateOnly());
}

function validateStayRange(value: { checkIn: string; checkOut: string }, context: z.RefinementCtx) {
  if (!isValidIsoDate(value.checkIn) || !isValidIsoDate(value.checkOut)) {
    return;
  }

  const checkIn = toDateOnly(value.checkIn);
  const checkOut = toDateOnly(value.checkOut);
  const today = todayDateOnly();
  const nights = differenceInNights(value.checkIn, value.checkOut);

  if (checkIn < today) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checkIn"],
      message: "Check-in must be today or later.",
    });
  }

  if (checkOut <= checkIn) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checkOut"],
      message: "Check-out must be after check-in.",
    });
  }

  if (nights < 1 || nights > 30) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checkOut"],
      message: "Stay length must be between 1 and 30 nights.",
    });
  }

  if (checkOut > addDays(today, 365)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checkOut"],
      message: "Check-out must be within 365 days.",
    });
  }
}

export const isoDateStringSchema = z
  .string()
  .regex(ISO_DATE_PATTERN, "Date must be in YYYY-MM-DD format.")
  .refine(isValidIsoDate, "Date must be a valid calendar date.");

export const roomTypeResponseSchema = z.object({
  id: z.string(),
  slug: roomTypeSlugSchema,
  name: z.string(),
  description: z.string(),
  capacity: z.number().int().positive(),
  basePriceBRL: z.string(),
  photos: z.array(z.string()),
});

export const availabilityQuerySchema = z
  .object({
    checkIn: isoDateStringSchema,
    checkOut: isoDateStringSchema,
    roomTypeId: z.string().min(1).optional(),
  })
  .superRefine(validateStayRange);

export const availabilityItemSchema = z.object({
  roomTypeId: z.string(),
  slug: roomTypeSlugSchema,
  availableRooms: z.number().int().min(0),
  totalRooms: z.number().int().min(0),
});

export const availabilityResponseSchema = z.object({
  checkIn: isoDateStringSchema,
  checkOut: isoDateStringSchema,
  roomTypes: z.array(availabilityItemSchema),
});

export const guestInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(6).max(30).optional(),
});

export const createReservationRequestSchema = z
  .object({
    roomTypeId: z.string().min(1),
    checkIn: isoDateStringSchema,
    checkOut: isoDateStringSchema,
    guestCount: z.number().int().min(1),
    guest: guestInputSchema,
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine(validateStayRange);

export const reservationCodeSchema = z
  .string()
  .trim()
  .regex(/^HST-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/);

export const lookupReservationQuerySchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const cancelReservationRequestSchema = lookupReservationQuerySchema;

export const reservationResponseSchema = z.object({
  code: reservationCodeSchema,
  status: reservationStatusSchema,
  checkIn: isoDateStringSchema,
  checkOut: isoDateStringSchema,
  guestCount: z.number().int().positive(),
  priceTotalBRL: z.string(),
  roomType: roomTypeResponseSchema,
});

export type Locale = z.infer<typeof localeSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type RoomTypeSlug = z.infer<typeof roomTypeSlugSchema>;
export type RoomTypeResponse = z.infer<typeof roomTypeResponseSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type CreateReservationRequest = z.infer<typeof createReservationRequestSchema>;
export type ReservationResponse = z.infer<typeof reservationResponseSchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const CANCELABLE_RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
] as const satisfies readonly ReservationStatus[];

export function isReservationCancelableStatus(status: string): status is ReservationStatus {
  return (CANCELABLE_RESERVATION_STATUSES as readonly string[]).includes(status);
}
