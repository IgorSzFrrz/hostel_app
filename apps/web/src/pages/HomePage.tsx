import { Link } from "@tanstack/react-router";
import { ArrowRight, Languages, MapPin, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RoomCard } from "../features/room-types/RoomCard";
import { useRoomTypes } from "../features/room-types/queries";

export function HomePage() {
  const { i18n, t } = useTranslation();
  const roomTypesQuery = useRoomTypes(i18n.language);
  const roomTypes = roomTypesQuery.data?.roomTypes ?? [];

  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden bg-ink text-white">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          src="/rooms/double-01.png"
          alt=""
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/15" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight sm:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">{t("home.copy")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                {t("home.primaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {t("home.secondaryCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-5">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-md bg-mist px-4 py-3 text-sm font-medium text-ink/75">
            <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
            {t("home.highlights.location")}
          </div>
          <div className="flex items-center gap-3 rounded-md bg-mist px-4 py-3 text-sm font-medium text-ink/75">
            <WalletCards className="h-4 w-4 text-clay" aria-hidden="true" />
            {t("home.highlights.arrival")}
          </div>
          <div className="flex items-center gap-3 rounded-md bg-mist px-4 py-3 text-sm font-medium text-ink/75">
            <Languages className="h-4 w-4 text-gold-dark" aria-hidden="true" />
            {t("home.highlights.languages")}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold text-ink">{t("home.sectionTitle")}</h2>
          <p className="mt-3 text-ink/70">{t("home.sectionCopy")}</p>
        </div>

        {roomTypesQuery.isError ? (
          <p className="mt-8 rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
            {t("common.unavailable")}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {roomTypes.length > 0
            ? roomTypes.map((roomType, index) => (
                <RoomCard key={roomType.id} roomType={roomType} priority={index === 0} />
              ))
            : [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="aspect-[4/3] animate-pulse rounded-md border border-ink/10 bg-mist"
                  aria-label={t("common.loading")}
                />
              ))}
        </div>
      </section>
    </main>
  );
}
