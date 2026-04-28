import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Facebook, Globe2, Home, Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AboutPage } from "../pages/AboutPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ReservationPage } from "../pages/ReservationPage";
import { RoomDetailPage } from "../pages/RoomDetailPage";
import { RoomsPage } from "../pages/RoomsPage";

function LanguageSwitch() {
  const { i18n, t } = useTranslation();

  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-black/70">
      <Globe2 className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{t("nav.language")}</span>
      <select
        className="rounded-md border border-black/15 bg-white px-2 py-1 text-sm font-semibold text-black outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20"
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
    { href: "/", label: t("nav.home") },
    { href: "/rooms", label: t("nav.rooms") },
    { href: "/#amenities", label: t("nav.amenities") },
    { href: "/about", label: t("nav.about") },
    { href: "/#location", label: t("nav.location") },
    // { href: "/#contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 rounded-b-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link to="/" className="inline-flex items-center gap-3 text-black">
          <Home className="h-9 w-9 stroke-[2.2]" aria-hidden="true" />
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-wide">WANDERLUST</span>
            <span className="mt-1 block text-xs font-bold tracking-[0.42em] text-orange">
              HOSTEL
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t("nav.primary")}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent py-2 text-sm font-medium text-black transition hover:border-orange hover:text-orange"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitch />
          <Link
            to="/reservation"
            className="rounded-lg bg-orange px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-dark focus:outline-none focus:ring-2 focus:ring-orange/30"
          >
            {t("nav.bookNow")}
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/15 bg-white text-black lg:hidden"
          type="button"
          aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-black/10 bg-white px-5 py-3 lg:hidden">
          <nav className="grid gap-1" aria-label={t("nav.primary")}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-black/75"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
            <LanguageSwitch />
            <Link
              to="/reservation"
              className="inline-flex rounded-lg bg-orange px-4 py-2 text-sm font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              {t("nav.bookNow")}
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
    <footer id="contact" className="bg-[#fbfaf7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link to="/" className="inline-flex items-center gap-3 text-black">
          <Home className="h-9 w-9 stroke-[2.2]" aria-hidden="true" />
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-wide">WANDERLUST</span>
            <span className="mt-1 block text-xs font-bold tracking-[0.42em] text-orange">
              HOSTEL
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-7 text-sm text-black/55">
          <a href="/privacy" className="hover:text-orange">
            {t("footer.privacy")}
          </a>
          <span aria-hidden="true">•</span>
          <a href="/terms" className="hover:text-orange">
            {t("footer.terms")}
          </a>
        </div>

        <div className="flex items-center gap-5 text-black">
          <a href="https://instagram.com" aria-label="Instagram" className="hover:text-orange">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://facebook.com" aria-label="Facebook" className="hover:text-orange">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="/" aria-label="Website" className="hover:text-orange">
            <Globe2 className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function RootLayout() {
  return (
    <div className="min-h-full bg-[#fbfaf7] text-black">
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

const reservationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservation",
  component: ReservationPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  roomsRoute,
  roomDetailRoute,
  reservationRoute,
  aboutRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
