import { useQuery } from "@tanstack/react-query";
import { getAvailability, type AvailabilityParams } from "../../lib/apiClient";

type UseAvailabilityOptions = AvailabilityParams & {
  enabled: boolean;
  locale: string;
};

export function useAvailability({
  checkIn,
  checkOut,
  roomTypeId,
  enabled,
  locale,
}: UseAvailabilityOptions) {
  return useQuery({
    queryKey: ["availability", locale, checkIn, checkOut, roomTypeId],
    queryFn: () => getAvailability({ checkIn, checkOut, roomTypeId }, locale),
    enabled,
  });
}
