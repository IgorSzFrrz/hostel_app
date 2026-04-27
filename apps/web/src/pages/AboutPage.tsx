import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section>
        <h1 className="font-display text-5xl font-semibold text-ink">{t("about.title")}</h1>
        <p className="mt-5 text-lg leading-8 text-ink/72">{t("about.copy")}</p>

        <div className="mt-8 grid gap-3 text-sm text-ink/75">
          <p className="font-semibold text-ink">{t("about.contact")}</p>
          <a
            className="inline-flex items-center gap-2 text-teal"
            href={`mailto:${t("about.email")}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("about.email")}
          </a>
          <a className="inline-flex items-center gap-2 text-teal" href={`tel:${t("about.phone")}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("about.phone")}
          </a>
        </div>
      </section>

      <img
        className="aspect-[4/3] w-full rounded-md object-cover"
        src="/rooms/group-02.png"
        alt=""
        aria-hidden="true"
      />
    </main>
  );
}
