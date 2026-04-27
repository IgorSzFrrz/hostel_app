import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRoomType } from "../features/room-types/queries";
import { formatBRL } from "../lib/currencyFormat";

type RoomDetailPageProps = {
  slug: string;
};

export function RoomDetailPage({ slug }: RoomDetailPageProps) {
  const { i18n, t } = useTranslation();
  const roomTypeQuery = useRoomType(slug, i18n.language);
  const roomType = roomTypeQuery.data;

  if (roomTypeQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {t("common.unavailable")}
        </p>
      </main>
    );
  }

  if (!roomType) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="aspect-[16/9] animate-pulse rounded-md bg-mist" />
      </main>
    );
  }

  const [primaryPhoto, secondaryPhoto] = roomType.photos;

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal transition hover:text-teal-dark"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("roomDetail.back")}
          </Link>

          <div className="mt-6 grid gap-3">
            <img
              className="aspect-[16/10] w-full rounded-md object-cover"
              src={primaryPhoto ?? "/rooms/double-01.png"}
              alt={roomType.name}
            />
            <div className="grid grid-cols-2 gap-3">
              {(secondaryPhoto
                ? [secondaryPhoto, primaryPhoto]
                : [primaryPhoto, "/rooms/double-02.png"]
              ).map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                  src={photo}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="self-start rounded-md border border-ink/10 bg-paper p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            {t("roomDetail.summary")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink">{roomType.name}</h1>
          <p className="mt-4 leading-7 text-ink/72">{roomType.description}</p>

          <dl className="mt-6 grid gap-4 border-y border-ink/10 py-5">
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-ink/65">
                <Users className="h-4 w-4 text-teal" aria-hidden="true" />
                {t("common.capacity", { count: roomType.capacity })}
              </dt>
              <dd className="font-semibold text-ink">{roomType.capacity}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-ink/65">{t("common.perNight")}</dt>
              <dd className="font-semibold text-ink">
                {formatBRL(roomType.basePriceBRL, i18n.language)}
              </dd>
            </div>
          </dl>

          <Link
            to="/booking"
            search={{ roomTypeId: roomType.id }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-clay px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay-dark focus:outline-none focus:ring-2 focus:ring-clay/25"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {t("roomDetail.reserve")}
          </Link>
        </aside>
      </section>
    </main>
  );
}
