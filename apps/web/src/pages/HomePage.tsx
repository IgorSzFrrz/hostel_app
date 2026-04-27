import { Link } from "@tanstack/react-router";
import { Clock3, Coffee, Luggage, MapPin, ShieldCheck, Sprout, Users, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RoomCard } from "../features/room-types/RoomCard";
import { useRoomTypes } from "../features/room-types/queries";

const amenities = [
  {
    icon: Wifi,
    titleKey: "home.amenities.wifi.title",
    copyKey: "home.amenities.wifi.copy",
  },
  {
    icon: Coffee,
    titleKey: "home.amenities.breakfast.title",
    copyKey: "home.amenities.breakfast.copy",
  },
  {
    icon: MapPin,
    titleKey: "home.amenities.location.title",
    copyKey: "home.amenities.location.copy",
  },
  {
    icon: Users,
    titleKey: "home.amenities.community.title",
    copyKey: "home.amenities.community.copy",
  },
  {
    icon: ShieldCheck,
    titleKey: "home.amenities.lockers.title",
    copyKey: "home.amenities.lockers.copy",
  },
  {
    icon: Clock3,
    titleKey: "home.amenities.reception.title",
    copyKey: "home.amenities.reception.copy",
  },
];

export function HomePage() {
  const { i18n, t } = useTranslation();
  const roomTypesQuery = useRoomTypes(i18n.language);
  const roomTypes = roomTypesQuery.data?.roomTypes ?? [];

  return (
    <main className="bg-[#fbfaf7]">
      <section className="mx-auto max-w-[1280px] px-0">
        <div className="relative min-h-[520px] overflow-hidden rounded-b-2xl bg-black text-white md:min-h-[560px]">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/rooms/hero-lobby.png"
            alt=""
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/36 to-black/8" />
          <div className="relative flex min-h-[520px] items-center px-8 py-16 md:min-h-[560px] md:px-24">
            <div className="max-w-[430px]">
              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight md:text-[64px]">
                {t("home.title")}
              </h1>
              <p className="mt-6 text-xl leading-8 text-white/90">{t("home.copy")}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/booking"
                  search={{ roomTypeId: undefined }}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-orange px-8 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-orange-dark"
                >
                  {t("home.primaryCta")}
                </Link>
                <Link
                  to="/rooms"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-orange shadow-lg shadow-black/15 transition hover:bg-orange-soft"
                >
                  {t("home.secondaryCta")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-orange">
            {t("home.roomsEyebrow")}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-black">
            {t("home.sectionTitle")}
          </h2>
          <p className="mt-4 text-sm leading-6 text-black/65">{t("home.sectionCopy")}</p>
        </div>

        {roomTypesQuery.isError ? (
          <p className="mx-auto mt-8 max-w-2xl rounded-lg border border-orange/25 bg-orange-soft px-4 py-3 text-center text-sm text-orange-dark">
            {t("home.unavailableRooms")}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {roomTypes.length > 0
            ? roomTypes.map((roomType, index) => (
                <RoomCard key={roomType.id} roomType={roomType} priority={index === 0} />
              ))
            : [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[420px] animate-pulse rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.09)]"
                />
              ))}
        </div>
      </section>

      <section id="amenities" className="mx-auto max-w-7xl px-5 py-2 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange">
            {t("home.amenitiesEyebrow")}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-black">
            {t("home.amenitiesTitle")}
          </h2>
        </div>

        <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;

            return (
              <div key={amenity.titleKey} className="text-center">
                <Icon className="mx-auto h-10 w-10 text-[#638147]" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-extrabold text-black">{t(amenity.titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-black/58">{t(amenity.copyKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="location" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange">
              {t("home.locationEyebrow")}
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-black">
              {t("home.locationTitle")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-black/65">
              {t("home.locationCopy")}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.11)]">
            <iframe
              className="h-[360px] w-full border-0"
              title={t("home.locationMapTitle")}
              src="https://www.google.com/maps?q=Est%C3%A1dio%20do%20Maracan%C3%A3&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl bg-[#faead4] px-6 py-10 shadow-[0_8px_28px_rgba(102,63,28,0.08)] md:px-12">
          <Luggage
            className="absolute left-8 top-1/2 hidden h-32 w-32 -translate-y-1/2 text-orange/30 md:block"
            aria-hidden="true"
          />
          <Sprout
            className="absolute right-10 top-1/2 hidden h-28 w-28 -translate-y-1/2 text-[#638147]/45 md:block"
            aria-hidden="true"
          />

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-black">{t("home.newsletterTitle")}</h2>
            <p className="mt-3 text-sm text-black/60">{t("home.newsletterCopy")}</p>
            <form className="mt-6 grid overflow-hidden rounded-lg bg-white shadow-sm sm:grid-cols-[1fr_1fr_auto]">
              <label className="sr-only" htmlFor="newsletter-name">
                {t("home.newsletterName")}
              </label>
              <input
                id="newsletter-name"
                className="min-h-12 border-b border-black/10 px-4 text-sm outline-none placeholder:text-black/40 sm:border-b-0 sm:border-r"
                placeholder={t("home.newsletterName")}
                type="text"
              />
              <label className="sr-only" htmlFor="newsletter-email">
                {t("home.newsletterEmail")}
              </label>
              <input
                id="newsletter-email"
                className="min-h-12 border-b border-black/10 px-4 text-sm outline-none placeholder:text-black/40 sm:border-b-0 sm:border-r"
                placeholder={t("home.newsletterEmail")}
                type="email"
              />
              <button
                className="min-h-12 bg-orange px-7 text-sm font-bold text-white transition hover:bg-orange-dark"
                type="submit"
              >
                {t("home.newsletterSubmit")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
