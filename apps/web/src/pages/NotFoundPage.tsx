import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl font-semibold text-ink">{t("notFound.title")}</h1>
      <p className="mt-4 text-ink/70">{t("notFound.copy")}</p>
      <Link
        to="/rooms"
        className="mt-8 inline-flex rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-dark"
      >
        {t("notFound.cta")}
      </Link>
    </main>
  );
}
