const STORAGE_KEY = "wanderlust-reservation";

export type StoredReservationLookup = {
  code: string;
  email: string;
};

export function getStoredReservationLookup(): StoredReservationLookup | null {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;

    const value = JSON.parse(rawValue) as Partial<StoredReservationLookup>;
    if (!value.code || !value.email) return null;

    return {
      code: value.code,
      email: value.email,
    };
  } catch {
    return null;
  }
}

export function setStoredReservationLookup(lookup: StoredReservationLookup) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      code: lookup.code,
      email: lookup.email.trim().toLowerCase(),
    }),
  );
}

export function clearStoredReservationLookup() {
  window.localStorage.removeItem(STORAGE_KEY);
}
