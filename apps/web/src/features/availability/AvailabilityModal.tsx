import type { RoomTypeResponse } from "@hostel/shared";
import { CalendarCheck, CalendarDays, Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useCreateReservation } from "../reservations/mutations";
import { formatBRL } from "../../lib/currencyFormat";
import {
  addDaysToIsoDate,
  getDefaultStayDates,
  getStayNights,
  todayIsoDate,
} from "../../lib/dateHelpers";
import { useAvailability } from "./queries";

type AvailabilityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomType: RoomTypeResponse;
};

export function AvailabilityModal({ isOpen, onClose, roomType }: AvailabilityModalProps) {
  const { i18n, t } = useTranslation();
  const defaultDates = useMemo(() => getDefaultStayDates(), []);
  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [submittedDates, setSubmittedDates] = useState(defaultDates);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [notes, setNotes] = useState("");

  const nights = getStayNights(checkIn, checkOut);
  const submittedNights = getStayNights(submittedDates.checkIn, submittedDates.checkOut);
  const hasValidDates = Boolean(checkIn && checkOut && nights >= 1 && nights <= 30);
  const hasValidSubmittedDates = Boolean(
    submittedDates.checkIn &&
    submittedDates.checkOut &&
    submittedNights >= 1 &&
    submittedNights <= 30,
  );
  const datesAreSynced = checkIn === submittedDates.checkIn && checkOut === submittedDates.checkOut;
  const minCheckOut = checkIn ? addDaysToIsoDate(checkIn, 1) : addDaysToIsoDate(todayIsoDate(), 1);
  const nightlyRate = Number(roomType.basePriceBRL);
  const submittedStayTotal = hasValidSubmittedDates ? nightlyRate * submittedNights : 0;
  const parsedGuestCount = Number(guestCount);
  const hasValidGuestCount =
    Number.isInteger(parsedGuestCount) &&
    parsedGuestCount >= 1 &&
    parsedGuestCount <= roomType.capacity;
  const hasGuestDetails = guestName.trim().length >= 2 && guestEmail.trim().length > 3;

  const availabilityQuery = useAvailability({
    checkIn: submittedDates.checkIn,
    checkOut: submittedDates.checkOut,
    roomTypeId: roomType.id,
    locale: i18n.language,
    enabled: isOpen && hasValidSubmittedDates,
  });

  const hasAvailabilityForSelectedDates =
    availabilityQuery.data?.checkIn === submittedDates.checkIn &&
    availabilityQuery.data.checkOut === submittedDates.checkOut;
  const availability = hasAvailabilityForSelectedDates
    ? availabilityQuery.data?.roomTypes.find((item) => item.roomTypeId === roomType.id)
    : undefined;
  const hasAvailabilityResult = Boolean(hasAvailabilityForSelectedDates && availabilityQuery.data);
  const availableRooms = availability?.availableRooms ?? 0;
  const isAvailable = availableRooms > 0;
  const canReserveSelectedDates = datesAreSynced && hasAvailabilityResult && isAvailable;
  const reservationMutation = useCreateReservation(i18n.language);
  const reservation = reservationMutation.data;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleCheckInChange(value: string) {
    setCheckIn(value);

    if (!value) return;

    if (!checkOut || getStayNights(value, checkOut) < 1) {
      setCheckOut(addDaysToIsoDate(value, 1));
    }

    reservationMutation.reset();
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value);
    reservationMutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasValidDates) return;

    reservationMutation.reset();
    if (datesAreSynced) {
      void availabilityQuery.refetch();
      return;
    }

    setSubmittedDates({ checkIn, checkOut });
  }

  function handleReservationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canReserveSelectedDates || !hasValidGuestCount || !hasGuestDetails) return;

    reservationMutation.mutate({
      roomTypeId: roomType.id,
      checkIn: submittedDates.checkIn,
      checkOut: submittedDates.checkOut,
      guestCount: parsedGuestCount,
      guest: {
        name: guestName.trim(),
        email: guestEmail.trim(),
        phone: guestPhone.trim() || undefined,
      },
      notes: notes.trim() || undefined,
    });
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-[#fbfaf7] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`availability-${roomType.id}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange">
              {t("roomAvailability.eyebrow")}
            </p>
            <h2
              id={`availability-${roomType.id}`}
              className="mt-1 text-2xl font-extrabold text-black"
            >
              {roomType.name}
            </h2>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-black/15 bg-white text-black transition hover:border-orange hover:text-orange"
            type="button"
            aria-label={t("roomAvailability.close")}
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <form className="grid gap-4" onSubmit={handleSubmit}>
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
                  onChange={(event) => handleCheckOutChange(event.target.value)}
                />
              </label>

              {!hasValidDates ? (
                <p className="rounded-lg bg-orange-soft px-4 py-3 text-sm font-medium text-orange-dark">
                  {t("booking.invalidDates")}
                </p>
              ) : null}

              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange px-6 text-sm font-bold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:bg-black/25"
                type="submit"
                disabled={!hasValidDates}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {t("roomAvailability.check")}
              </button>
            </form>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                {t("roomAvailability.summary")}
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/60">{t("roomAvailability.days")}</dt>
                  <dd className="font-extrabold text-black">
                    {t("roomAvailability.selectedDays", { count: submittedNights })}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/60">{t("roomAvailability.nightlyRate")}</dt>
                  <dd className="font-extrabold text-black">
                    {formatBRL(roomType.basePriceBRL, i18n.language)}
                  </dd>
                </div>
                <div className="border-t border-black/10 pt-3">
                  <dt className="text-black/60">{t("roomAvailability.totalEstimate")}</dt>
                  <dd className="mt-1 text-3xl font-extrabold text-black">
                    {formatBRL(submittedStayTotal, i18n.language)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                {t("booking.resultsEyebrow")}
              </p>

              {!datesAreSynced ? (
                <p className="mt-4 rounded-lg bg-[#f7f1e9] px-4 py-3 text-sm font-medium text-black/60">
                  {t("roomAvailability.pendingDates")}
                </p>
              ) : null}

              {availabilityQuery.isFetching && !hasAvailabilityResult ? (
                <div className="mt-4 rounded-lg bg-[#f7f1e9] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-orange/25 border-t-orange"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-black/60">
                      {t("roomAvailability.checking")}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <span className="h-2 w-28 animate-pulse rounded-full bg-orange/20" />
                    <span className="h-2 w-40 animate-pulse rounded-full bg-black/10" />
                  </div>
                </div>
              ) : null}

              {availabilityQuery.isError ? (
                <p className="mt-4 rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-sm text-orange-dark">
                  {t("booking.unavailable")}
                </p>
              ) : null}

              {hasAvailabilityResult ? (
                <div className="mt-4">
                  <p className="text-sm text-black/60">
                    {submittedDates.checkIn} - {submittedDates.checkOut} -{" "}
                    {t("booking.nights", { count: submittedNights })}
                  </p>
                  <p className="mt-3 text-xl font-extrabold text-black">
                    {isAvailable
                      ? t("booking.availableRooms", { count: availableRooms })
                      : t("booking.noAvailability")}
                  </p>
                  <p className="mt-2 text-sm text-black/60">
                    {t("roomAvailability.estimatedTotalForDates", {
                      total: formatBRL(submittedStayTotal, i18n.language),
                    })}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              {reservation ? (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                    {t("reservation.successTitle")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-black/65">
                    {t("reservation.successCopy")}
                  </p>
                  <dl className="mt-4 grid gap-3 rounded-lg bg-[#f7f1e9] p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-black/60">{t("reservation.codeLabel")}</dt>
                      <dd className="font-extrabold text-black">{reservation.code}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-black/60">{t("roomAvailability.totalEstimate")}</dt>
                      <dd className="font-extrabold text-black">
                        {formatBRL(reservation.priceTotalBRL, i18n.language)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={handleReservationSubmit}>
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                      {t("reservation.title")}
                    </p>
                    {!canReserveSelectedDates ? (
                      <p className="mt-2 text-sm leading-6 text-black/60">
                        {t("reservation.availabilityRequired")}
                      </p>
                    ) : null}
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-black">{t("reservation.name")}</span>
                    <input
                      className="min-h-11 rounded-lg border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                      type="text"
                      autoComplete="name"
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-black">{t("reservation.email")}</span>
                    <input
                      className="min-h-11 rounded-lg border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                      type="email"
                      autoComplete="email"
                      value={guestEmail}
                      onChange={(event) => setGuestEmail(event.target.value)}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-black">{t("reservation.phone")}</span>
                      <input
                        className="min-h-11 rounded-lg border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                        type="tel"
                        autoComplete="tel"
                        value={guestPhone}
                        onChange={(event) => setGuestPhone(event.target.value)}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-black">
                        {t("reservation.guestCount")}
                      </span>
                      <input
                        className="min-h-11 rounded-lg border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                        type="number"
                        min={1}
                        max={roomType.capacity}
                        value={guestCount}
                        onChange={(event) => setGuestCount(event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-black">{t("reservation.notes")}</span>
                    <textarea
                      className="min-h-24 resize-y rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>

                  {!hasValidGuestCount ? (
                    <p className="rounded-lg bg-orange-soft px-4 py-3 text-sm font-medium text-orange-dark">
                      {t("reservation.guestCountError", { count: roomType.capacity })}
                    </p>
                  ) : null}

                  {reservationMutation.isError ? (
                    <p className="rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-sm text-orange-dark">
                      {t("reservation.error")}
                    </p>
                  ) : null}

                  <button
                    className="inline-flex min-h-12 items-center justify-center rounded-lg bg-orange px-6 text-sm font-bold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:bg-black/25"
                    type="submit"
                    disabled={
                      !canReserveSelectedDates ||
                      !hasValidGuestCount ||
                      !hasGuestDetails ||
                      reservationMutation.isPending
                    }
                  >
                    {reservationMutation.isPending
                      ? t("reservation.submitting")
                      : t("reservation.submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
