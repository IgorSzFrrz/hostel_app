import { useQuery } from "@tanstack/react-query";
import { getRoomType, getRoomTypes } from "../../lib/apiClient";

export function useRoomTypes(locale: string) {
  return useQuery({
    queryKey: ["room-types", locale],
    queryFn: () => getRoomTypes(locale),
  });
}

export function useRoomType(slug: string, locale: string) {
  return useQuery({
    queryKey: ["room-type", slug, locale],
    queryFn: () => getRoomType(slug, locale),
  });
}
