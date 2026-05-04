import type {
  AvailabilityResponse,
  CreateReservationRequest,
  ReservationResponse,
  RoomTypeResponse,
} from "@hostel/shared";

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

async function apiFetch<T>(path: string, locale: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
      ...init?.headers,
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

export type AvailabilityParams = {
  checkIn: string;
  checkOut: string;
  roomTypeId?: string;
};

export function getAvailability(params: AvailabilityParams, locale: string) {
  const searchParams = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
  });

  if (params.roomTypeId) {
    searchParams.set("roomTypeId", params.roomTypeId);
  }

  return apiFetch<AvailabilityResponse>(`/v1/availability?${searchParams.toString()}`, locale);
}

export function createReservation(payload: CreateReservationRequest, locale: string) {
  return apiFetch<ReservationResponse>("/v1/reservations", locale, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function getReservation(code: string, email: string, locale: string) {
  return apiFetch<ReservationResponse>(
    `/v1/reservations/${encodeURIComponent(code)}/lookup`,
    locale,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );
}

export function cancelReservation(code: string, email: string, locale: string) {
  return apiFetch<ReservationResponse>(
    `/v1/reservations/${encodeURIComponent(code)}/cancel`,
    locale,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );
}
