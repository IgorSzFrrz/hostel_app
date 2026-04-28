import type { ReservationResponse } from "@hostel/shared";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CreditCard, Search, Users, XCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCancelReservation } from "../features/reservations/mutations";
import { useReservation } from "../features/reservations/queries";
import { formatBRL } from "../lib/currencyFormat";
import {
  clearStoredReservationLookup,
  getStoredReservationLookup,
  setStoredReservationLookup,
  type StoredReservationLookup,
} from "../lib/reservationStorage";

type ReservationStatus = ReservationResponse["status"];

function getStatusClassName(status: ReservationStatus) {
  if (status === "CANCELLED" || status === "NO_SHOW") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (status === "CHECKED_IN" || status === "CHECKED_OUT") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
}

function canCancelReservation(status: ReservationStatus) {
  return status === "PENDING" || status === "CONFIRMED";
}

export function ReservationPage() {
  const { i18n, t } = useTranslation();
  const [lookup, setLookup] = useState<StoredReservationLookup | null>(() =>
    getStoredReservationLookup(),
  );
  const [code, setCode] = useState(lookup?.code ?? "");
  const [email, setEmail] = useState(lookup?.email ?? "");

  const reservationQuery = useReservation({
    code: lookup?.code ?? "",
    email: lookup?.email ?? "",
    locale: i18n.language,
    enabled: Boolean(lookup?.code && lookup?.email),
  });
  const cancelReservationMutation = useCancelReservation(i18n.language);
  const reservation = cancelReservationMutation.data ?? reservationQuery.data;
  const isCancelable = reservation ? canCancelReservation(reservation.status) : false;

  useEffect(() => {
    if (!reservation || !lookup) return;

    setStoredReservationLookup(lookup);
  }, [lookup, reservation]);

  function handleLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLookup = {
      code: code.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    };

    if (!nextLookup.code || !nextLookup.email) return;

    cancelReservationMutation.reset();
    setLookup(nextLookup);
  }

  function handleClearLookup() {
    clearStoredReservationLookup();
    cancelReservationMutation.reset();
    setLookup(null);
    setCode("");
    setEmail("");
  }

  function handleCancelReservation() {
    if (!lookup || !reservation || !isCancelable) return;

    const confirmed = window.confirm(
      t("reservationPage.cancelConfirm", { code: reservation.code }),
    );
    if (!confirmed) return;

    cancelReservationMutation.mutate({
      code: reservation.code,
      email: lookup.email,
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <section>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange">
            {t("reservationPage.eyebrow")}
          </p>
          <h1 className="mt-3 max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-black">
            {reservation ? t("reservationPage.mineTitle") : t("reservationPage.title")}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-black/65">
            {t("reservationPage.copy")}
          </p>

          {!lookup ? (
            <div className="mt-7 rounded-xl border border-orange/15 bg-orange-soft/70 p-5">
              <h2 className="text-lg font-extrabold text-black">
                {t("reservationPage.emptyTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/65">
                {t("reservationPage.emptyCopy")}
              </p>
              <Link
                to="/rooms"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange px-5 text-sm font-bold text-white transition hover:bg-orange-dark"
              >
                {t("reservationPage.chooseRoom")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </section>

        <section className="grid gap-5">
          <form
            className="rounded-xl bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.09)]"
            onSubmit={handleLookupSubmit}
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                  {t("reservationPage.lookupTitle")}
                </p>
                <p className="mt-2 text-sm text-black/60">{t("reservationPage.lookupCopy")}</p>
              </div>
              {lookup ? (
                <button
                  className="text-sm font-bold text-black/50 transition hover:text-orange"
                  type="button"
                  onClick={handleClearLookup}
                >
                  {t("reservationPage.clearLookup")}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-black">{t("reservationPage.code")}</span>
                <input
                  className="min-h-12 rounded-lg border border-black/15 bg-white px-4 text-sm font-semibold uppercase text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="HST-ABCDE"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-black">{t("reservationPage.email")}</span>
                <input
                  className="min-h-12 rounded-lg border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                />
              </label>

              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-lg bg-orange px-6 text-sm font-bold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:bg-black/25"
                type="submit"
                disabled={!code.trim() || !email.trim() || reservationQuery.isFetching}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {reservationQuery.isFetching
                  ? t("reservationPage.searching")
                  : t("reservationPage.search")}
              </button>
            </div>
          </form>

          {reservationQuery.isError ? (
            <p className="rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-sm text-orange-dark">
              {t("reservationPage.notFound")}
            </p>
          ) : null}

          {reservationQuery.isLoading && lookup ? (
            <div className="grid gap-4 rounded-xl bg-white p-5 shadow-sm">
              <span className="h-4 w-40 animate-pulse rounded-full bg-orange/20" />
              <span className="h-8 w-64 animate-pulse rounded-full bg-black/10" />
              <span className="h-24 animate-pulse rounded-lg bg-black/5" />
            </div>
          ) : null}

          {reservation ? (
            <article className="overflow-hidden rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.09)]">
              <img
                className="aspect-[2.4] w-full object-cover"
                src={reservation.roomType.photos[0] ?? "/rooms/double-01.png"}
                alt={reservation.roomType.name}
              />
              <div className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
                      {t("reservationPage.mineTitle")}
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold text-black">
                      {reservation.roomType.name}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ring-1 ${getStatusClassName(
                      reservation.status,
                    )}`}
                  >
                    {t(`reservationStatus.${reservation.status}`)}
                  </span>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#f7f1e9] p-4">
                    <dt className="inline-flex items-center gap-2 text-sm text-black/60">
                      <CalendarDays className="h-4 w-4 text-orange" aria-hidden="true" />
                      {t("reservationPage.dates")}
                    </dt>
                    <dd className="mt-2 font-extrabold text-black">
                      {reservation.checkIn} - {reservation.checkOut}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[#f7f1e9] p-4">
                    <dt className="inline-flex items-center gap-2 text-sm text-black/60">
                      <Users className="h-4 w-4 text-orange" aria-hidden="true" />
                      {t("reservationPage.guests")}
                    </dt>
                    <dd className="mt-2 font-extrabold text-black">
                      {t("common.guest", { count: reservation.guestCount })}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[#f7f1e9] p-4">
                    <dt className="text-sm text-black/60">{t("reservationPage.room")}</dt>
                    <dd className="mt-2 font-extrabold text-black">
                      <Link
                        to="/rooms/$slug"
                        params={{ slug: reservation.roomType.slug }}
                        className="transition hover:text-orange"
                      >
                        {reservation.roomType.name}
                      </Link>
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[#f7f1e9] p-4">
                    <dt className="inline-flex items-center gap-2 text-sm text-black/60">
                      <CreditCard className="h-4 w-4 text-orange" aria-hidden="true" />
                      {t("reservationPage.total")}
                    </dt>
                    <dd className="mt-2 text-2xl font-extrabold text-black">
                      {formatBRL(reservation.priceTotalBRL, i18n.language)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/rooms"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/15 px-5 text-sm font-bold text-black/70 transition hover:border-orange hover:text-orange"
                  >
                    {t("reservationPage.chooseAnotherRoom")}
                  </Link>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-black/15 disabled:text-black/35 disabled:hover:bg-transparent"
                    type="button"
                    disabled={!isCancelable || cancelReservationMutation.isPending}
                    onClick={handleCancelReservation}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    {cancelReservationMutation.isPending
                      ? t("reservationPage.canceling")
                      : t("reservationPage.cancel")}
                  </button>
                </div>

                {!isCancelable ? (
                  <p className="mt-4 text-sm text-black/55">
                    {t("reservationPage.cancelUnavailable")}
                  </p>
                ) : null}

                {cancelReservationMutation.isError ? (
                  <p className="mt-4 rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-sm text-orange-dark">
                    {t("reservationPage.cancelError")}
                  </p>
                ) : null}
              </div>
            </article>
          ) : null}
        </section>
      </div>
    </main>
  );
}
