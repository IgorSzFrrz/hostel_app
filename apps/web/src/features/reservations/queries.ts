import { useQuery } from "@tanstack/react-query";
import { getReservation } from "../../lib/apiClient";

type UseReservationOptions = {
  code: string;
  email: string;
  enabled: boolean;
  locale: string;
};

export function useReservation({ code, email, enabled, locale }: UseReservationOptions) {
  return useQuery({
    queryKey: ["reservation", locale, code, email],
    queryFn: () => getReservation(code, email, locale),
    enabled,
  });
}
