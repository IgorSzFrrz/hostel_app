import { Link } from "@tanstack/react-router";
import { Bath, Bed, BedDouble, CalendarDays, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RoomTypeResponse } from "@hostel/shared";
import { AvailabilityModal } from "../availability/AvailabilityModal";

type RoomCardProps = {
  roomType: RoomTypeResponse;
  priority?: boolean;
};

const roomMeta = {
  single: {
    icon: Bed,
    accent: "text-[#5b7a43]",
    iconBg: "bg-[#eef4e7]",
    border: "border-[#8aa06f]",
    specs: [
      { key: "common.guest", count: 1 },
      { key: "common.bed", count: 1 },
      { key: "common.sharedBath" },
    ],
  },
  double: {
    icon: BedDouble,
    accent: "text-orange",
    iconBg: "bg-[#fff1df]",
    border: "border-orange",
    specs: [
      { key: "common.guest", count: 2 },
      { key: "common.bed", count: 1 },
      { key: "common.privateBath" },
    ],
  },
  group: {
    icon: Users,
    accent: "text-[#2d5b82]",
    iconBg: "bg-[#e8f0f7]",
    border: "border-[#7898b4]",
    specs: [
      { key: "common.guest", count: 4 },
      { key: "common.bunkBed", count: 2 },
      { key: "common.sharedBath" },
    ],
  },
} as const;

const specIcons = [Users, Bed, Bath];

export function RoomCard({ roomType, priority = false }: RoomCardProps) {
  const { t } = useTranslation();
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const image = roomType.photos[0] ?? "/rooms/double-01.png";
  const meta = roomMeta[roomType.slug];
  const Icon = meta.icon;

  return (
    <>
      <article className="overflow-hidden rounded-xl bg-white shadow-[0_14px_34px_rgba(15,23,42,0.11)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.15)]">
        <Link to="/rooms/$slug" params={{ slug: roomType.slug }} className="block">
          <img
            className="aspect-[1.42] w-full object-cover"
            src={image}
            alt={roomType.name}
            loading={priority ? "eager" : "lazy"}
          />
        </Link>
        <div className="grid gap-6 p-6">
          <div className="grid grid-cols-[56px_1fr] gap-4">
            <span className={`grid h-14 w-14 place-items-center rounded-full ${meta.iconBg}`}>
              <Icon className={`h-7 w-7 ${meta.accent}`} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-black">{roomType.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/70">
                {roomType.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-xs font-medium text-black/70">
            {meta.specs.map((spec, index) => {
              const SpecIcon = specIcons[index] ?? Bed;

              return (
                <span key={`${spec.key}-${index}`} className="inline-flex items-center gap-1.5">
                  <SpecIcon className="h-4 w-4 text-black/75" aria-hidden="true" />
                  {t(spec.key, "count" in spec ? { count: spec.count } : undefined)}
                </span>
              );
            })}
          </div>

          <div className="grid gap-3">
            <button
              className={`inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition hover:bg-orange hover:text-white ${meta.border} ${meta.accent}`}
              type="button"
              aria-haspopup="dialog"
              onClick={() => setIsAvailabilityOpen(true)}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {t("roomAvailability.open")}
            </button>
            <Link
              to="/rooms/$slug"
              params={{ slug: roomType.slug }}
              className="text-center text-sm font-bold text-black/55 transition hover:text-orange"
            >
              {t("common.viewRoom")}
            </Link>
          </div>
        </div>
      </article>
      <AvailabilityModal
        isOpen={isAvailabilityOpen}
        roomType={roomType}
        onClose={() => setIsAvailabilityOpen(false)}
      />
    </>
  );
}
