import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { BedDouble, CalendarDays, Globe2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AboutPage } from "../pages/AboutPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RoomDetailPage } from "../pages/RoomDetailPage";
import { RoomsPage } from "../pages/RoomsPage";

function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink/75">
      <Globe2 className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        className="rounded-md border border-ink/15 bg-white px-2 py-1 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        value={i18n.language}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </label>
  );
}

function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/rooms", label: t("nav.rooms") },
    { to: "/about", label: t("nav.about") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-teal text-white">
            <BedDouble className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold">Hostel App</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.primary")}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-mist hover:text-ink"
              activeProps={{ className: "bg-mist text-ink" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch />
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 rounded-md bg-clay px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clay-dark focus:outline-none focus:ring-2 focus:ring-clay/25"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {t("nav.checkAvailability")}
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/15 bg-white text-ink md:hidden"
          type="button"
          aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-ink/10 bg-paper px-4 py-3 md:hidden">
          <nav className="grid gap-1" aria-label={t("nav.primary")}>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink/75"
                activeProps={{ className: "bg-mist text-ink" }}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
            <LanguageSwitch />
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white"
              onClick={() => setIsOpen(false)}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {t("nav.checkAvailability")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink/65 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>Hostel App</p>
        <p>{t("footer.location")}</p>
      </div>
    </footer>
  );
}

function RootLayout() {
  return (
    <div className="min-h-full bg-surface text-ink">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms",
  component: RoomsPage,
});

const roomDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms/$slug",
  component: function RoomDetailRoute() {
    const { slug } = roomDetailRoute.useParams();
    return <RoomDetailPage slug={slug} />;
  },
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([homeRoute, roomsRoute, roomDetailRoute, aboutRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
