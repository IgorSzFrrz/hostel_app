import type { RoomTypeResponse } from "@hostel/shared";

export type RoomTypesResponse = {
  roomTypes: RoomTypeResponse[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, locale: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export function getRoomTypes(locale: string) {
  return apiFetch<RoomTypesResponse>("/v1/room-types", locale);
}

export function getRoomType(slug: string, locale: string) {
  return apiFetch<RoomTypeResponse>(`/v1/room-types/${encodeURIComponent(slug)}`, locale);
}
