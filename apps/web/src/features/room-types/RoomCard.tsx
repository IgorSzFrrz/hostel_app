import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RoomTypeResponse } from "@hostel/shared";
import { formatBRL } from "../../lib/currencyFormat";

type RoomCardProps = {
  roomType: RoomTypeResponse;
  priority?: boolean;
};

export function RoomCard({ roomType, priority = false }: RoomCardProps) {
  const { i18n, t } = useTranslation();
  const image = roomType.photos[0] ?? "/rooms/double-01.png";

  return (
    <article className="overflow-hidden rounded-md border border-ink/10 bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to="/rooms/$slug" params={{ slug: roomType.slug }} className="block">
        <img
          className="aspect-[4/3] w-full object-cover"
          src={image}
          alt={roomType.name}
          loading={priority ? "eager" : "lazy"}
        />
      </Link>
      <div className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">{roomType.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/70">
              {roomType.description}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-mist px-2.5 py-1 text-sm text-teal-dark">
            <Users className="h-4 w-4" aria-hidden="true" />
            {roomType.capacity}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="text-sm text-ink/65">
            {t("common.from")}{" "}
            <strong className="text-lg font-semibold text-ink">
              {formatBRL(roomType.basePriceBRL, i18n.language)}
            </strong>{" "}
            {t("common.perNight")}
          </p>
          <Link
            to="/rooms/$slug"
            params={{ slug: roomType.slug }}
            className="inline-flex items-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal/25"
          >
            {t("common.viewRoom")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
