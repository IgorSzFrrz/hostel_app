import {
  addDays,
  differenceInNights,
  toDateOnly,
  toIsoDateOnly,
  toPropertyIsoDateOnly,
} from "@hostel/shared";

export function todayIsoDate() {
  return toPropertyIsoDateOnly();
}

export function addDaysToIsoDate(value: string, days: number) {
  return toIsoDateOnly(addDays(toDateOnly(value), days));
}

export function getDefaultStayDates() {
  const checkIn = todayIsoDate();

  return {
    checkIn,
    checkOut: addDaysToIsoDate(checkIn, 1),
  };
}

export function getStayNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;

  try {
    return differenceInNights(checkIn, checkOut);
  } catch {
    return 0;
  }
}
