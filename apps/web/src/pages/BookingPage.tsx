import { CalendarCheck, CalendarDays, Search, Users } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAvailability } from "../features/availability/queries";
import { useRoomTypes } from "../features/room-types/queries";
import {
  addDaysToIsoDate,
  getDefaultStayDates,
  getStayNights,
  todayIsoDate,
} from "../lib/dateHelpers";

export function BookingPage() {
  const { i18n, t } = useTranslation();
  const defaultDates = useMemo(() => getDefaultStayDates(), []);
  const initialRoomTypeId = useMemo(
    () => new URLSearchParams(window.location.search).get("roomTypeId") ?? "",
    [],
  );
  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId);
  const [submittedDates, setSubmittedDates] = useState(defaultDates);
  const [submittedRoomTypeId, setSubmittedRoomTypeId] = useState(initialRoomTypeId);

  const roomTypesQuery = useRoomTypes(i18n.language);
  const roomTypes = roomTypesQuery.data?.roomTypes ?? [];
  const roomTypesById = useMemo(
    () => new Map(roomTypes.map((roomType) => [roomType.id, roomType])),
    [roomTypes],
  );

  const nights = getStayNights(checkIn, checkOut);
  const submittedNights = getStayNights(submittedDates.checkIn, submittedDates.checkOut);
  const hasValidDates = Boolean(checkIn && checkOut && nights >= 1 && nights <= 30);
  const minCheckOut = checkIn ? addDaysToIsoDate(checkIn, 1) : addDaysToIsoDate(todayIsoDate(), 1);

  const availabilityQuery = useAvailability({
    checkIn: submittedDates.checkIn,
    checkOut: submittedDates.checkOut,
    roomTypeId: submittedRoomTypeId || undefined,
    locale: i18n.language,
    enabled: Boolean(submittedDates.checkIn && submittedDates.checkOut),
  });

  function handleCheckInChange(value: string) {
    setCheckIn(value);

    if (!value) return;

    if (!checkOut || getStayNights(value, checkOut) < 1) {
      setCheckOut(addDaysToIsoDate(value, 1));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasValidDates) return;

    setSubmittedDates({ checkIn, checkOut });
    setSubmittedRoomTypeId(roomTypeId);
  }

  return (
    <main className="bg-[#fbfaf7]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange">
              {t("booking.eyebrow")}
            </p>
            <h1 className="mt-3 max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-black">
              {t("booking.title")}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/65">{t("booking.copy")}</p>
          </div>

          <form
            className="rounded-2xl bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.11)]"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="grid gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
                  <CalendarDays className="h-4 w-4 text-orange" aria-hidden="true" />
                  {t("booking.checkIn")}
                </span>
                <input
                  className="min-h-12 rounded-lg border border-black/15 bg-white px-4 text-sm font-semibold text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                  type="date"
                  min={todayIsoDate()}
                  value={checkIn}
                  onChange={(event) => handleCheckInChange(event.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
                  <CalendarCheck className="h-4 w-4 text-orange" aria-hidden="true" />
                  {t("booking.checkOut")}
                </span>
                <input
                  className="min-h-12 rounded-lg border border-black/15 bg-white px-4 text-sm font-semibold text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                  type="date"
                  min={minCheckOut}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                />
              </label>

              <label className="grid gap-2 md:col-span-2 xl:col-span-1">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
                  <Users className="h-4 w-4 text-orange" aria-hidden="true" />
                  {t("booking.roomType")}
                </span>
                <select
                  className="min-h-12 rounded-lg border border-black/15 bg-white px-4 text-sm font-semibold text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                  value={roomTypeId}
                  onChange={(event) => setRoomTypeId(event.target.value)}
                >
                  <option value="">{t("booking.allRooms")}</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-lg bg-orange px-6 text-sm font-bold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:bg-black/25 md:col-span-2 xl:col-span-1"
                type="submit"
                disabled={!hasValidDates}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {t("booking.search")}
              </button>
            </div>

            {!hasValidDates ? (
              <p className="mt-4 rounded-lg bg-orange-soft px-4 py-3 text-sm font-medium text-orange-dark">
                {t("booking.invalidDates")}
              </p>
            ) : (
              <p className="mt-4 text-sm text-black/60">{t("booking.nights", { count: nights })}</p>
            )}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-12">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
              {t("booking.resultsEyebrow")}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-black">{t("booking.resultsTitle")}</h2>
          </div>
          <p className="text-sm font-semibold text-black/60">
            {submittedDates.checkIn} - {submittedDates.checkOut} ·{" "}
            {t("booking.nights", { count: submittedNights })}
          </p>
        </div>

        {availabilityQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-xl bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {availabilityQuery.isError ? (
          <p className="rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-sm text-orange-dark">
            {t("booking.unavailable")}
          </p>
        ) : null}

        {availabilityQuery.data ? (
          <div className="grid gap-5 md:grid-cols-3">
            {availabilityQuery.data.roomTypes.map((availability) => {
              const roomType = roomTypesById.get(availability.roomTypeId);
              const isAvailable = availability.availableRooms > 0;

              return (
                <article
                  key={availability.roomTypeId}
                  className="rounded-xl bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.09)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-black">
                        {roomType?.name ?? availability.slug}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/60">
                        {roomType?.description}
                      </p>
                    </div>
                    {roomType?.photos[0] ? (
                      <img
                        className="h-16 w-16 rounded-lg object-cover"
                        src={roomType.photos[0]}
                        alt=""
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-lg bg-[#f7f1e9] px-4 py-3">
                    <p className="text-sm font-semibold text-black/62">
                      {isAvailable
                        ? t("booking.availableRooms", { count: availability.availableRooms })
                        : t("booking.noAvailability")}
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      {t("booking.totalRooms", { count: availability.totalRooms })}
                    </p>
                  </div>

                  <button
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-orange px-4 py-3 text-sm font-bold text-orange transition hover:bg-orange hover:text-white disabled:cursor-not-allowed disabled:border-black/20 disabled:text-black/35 disabled:hover:bg-transparent"
                    type="button"
                    disabled={!isAvailable}
                  >
                    {isAvailable ? t("booking.chooseRoom") : t("booking.soldOut")}
                  </button>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
