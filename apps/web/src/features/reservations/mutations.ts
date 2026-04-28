import type { CreateReservationRequest } from "@hostel/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReservation, createReservation } from "../../lib/apiClient";
import { setStoredReservationLookup } from "../../lib/reservationStorage";

export function useCreateReservation(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReservationRequest) => createReservation(payload, locale),
    onSuccess: (reservation, payload) => {
      setStoredReservationLookup({
        code: reservation.code,
        email: payload.guest.email,
      });
      void queryClient.invalidateQueries({ queryKey: ["availability"] });
      void queryClient.invalidateQueries({ queryKey: ["reservation"] });
    },
  });
}

type CancelReservationVariables = {
  code: string;
  email: string;
};

export function useCancelReservation(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, email }: CancelReservationVariables) =>
      cancelReservation(code, email, locale),
    onSuccess: (reservation, variables) => {
      setStoredReservationLookup({
        code: reservation.code,
        email: variables.email,
      });
      void queryClient.invalidateQueries({ queryKey: ["availability"] });
      void queryClient.invalidateQueries({ queryKey: ["reservation"] });
    },
  });
}
