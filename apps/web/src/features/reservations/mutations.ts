import type { CreateReservationRequest } from "@hostel/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReservation } from "../../lib/apiClient";

export function useCreateReservation(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReservationRequest) => createReservation(payload, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}
