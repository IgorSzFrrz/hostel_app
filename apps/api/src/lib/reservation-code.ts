import { randomInt } from "node:crypto";
import { ReservationStatus } from "@prisma/client";

const RESERVATION_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const RESERVATION_CODE_LENGTH = 5;

export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

export function generateReservationCode(): string {
  let suffix = "";

  for (let index = 0; index < RESERVATION_CODE_LENGTH; index += 1) {
    suffix += RESERVATION_CODE_ALPHABET.charAt(randomInt(RESERVATION_CODE_ALPHABET.length));
  }

  return `HST-${suffix}`;
}
