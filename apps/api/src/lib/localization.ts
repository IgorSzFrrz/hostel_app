import type { RoomType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { LOCALES, roomTypeSlugSchema, type Locale, type RoomTypeResponse } from "@hostel/shared";

function isJsonRecord(value: Prisma.JsonValue): value is Record<string, Prisma.JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pickLocale(acceptLanguage: string | undefined): Locale {
  if (!acceptLanguage) return "pt";

  for (const entry of acceptLanguage.split(",")) {
    const language = entry.split(";")[0]?.trim().toLowerCase();
    if (!language) continue;

    const baseLanguage = language.split("-")[0];
    if (baseLanguage && LOCALES.includes(baseLanguage as Locale)) {
      return baseLanguage as Locale;
    }
  }

  return "pt";
}

export function localizeJson(value: Prisma.JsonValue, locale: Locale): string {
  if (!isJsonRecord(value)) return "";

  const localizedValue = value[locale];
  if (typeof localizedValue === "string") return localizedValue;

  const fallbackValue = value.pt;
  return typeof fallbackValue === "string" ? fallbackValue : "";
}

export function serializeRoomType(roomType: RoomType, locale: Locale): RoomTypeResponse {
  return {
    id: roomType.id,
    slug: roomTypeSlugSchema.parse(roomType.slug),
    name: localizeJson(roomType.name, locale),
    description: localizeJson(roomType.description, locale),
    capacity: roomType.capacity,
    basePriceBRL: roomType.basePriceBRL.toFixed(2),
    photos: roomType.photos,
  };
}
