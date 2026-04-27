import { useTranslation } from "react-i18next";
import { RoomCard } from "../features/room-types/RoomCard";
import { useRoomTypes } from "../features/room-types/queries";

export function RoomsPage() {
  const { i18n, t } = useTranslation();
  const roomTypesQuery = useRoomTypes(i18n.language);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl font-semibold text-ink">{t("rooms.title")}</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">{t("rooms.copy")}</p>
      </div>

      {roomTypesQuery.isError ? (
        <p className="mt-8 rounded-md border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {t("common.unavailable")}
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {roomTypesQuery.data?.roomTypes.map((roomType, index) => (
          <RoomCard key={roomType.id} roomType={roomType} priority={index === 0} />
        ))}
      </div>
    </main>
  );
}
