import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  pt: {
    translation: {
      nav: {
        primary: "Navegacao principal",
        home: "Inicio",
        rooms: "Quartos",
        about: "Sobre",
        checkAvailability: "Ver quartos",
        openMenu: "Abrir menu",
        closeMenu: "Fechar menu",
      },
      footer: {
        location: "Pousada independente, Brasil",
      },
      common: {
        from: "a partir de",
        perNight: "por noite",
        guests: "{{count}} hospede",
        guests_plural: "{{count}} hospedes",
        capacity: "Ate {{count}} pessoas",
        viewRoom: "Ver quarto",
        loading: "Carregando",
        retry: "Tentar novamente",
        unavailable: "Nao foi possivel carregar os dados agora.",
      },
      home: {
        eyebrow: "Pousada, bed and breakfast e hostel",
        title: "Hostel App",
        copy: "Quartos compactos, atendimento direto e reserva simples para estadias curtas.",
        primaryCta: "Conhecer quartos",
        secondaryCta: "Sobre a pousada",
        sectionTitle: "Escolha o formato da sua estadia",
        sectionCopy: "Opcoes para viajantes solo, casais e pequenos grupos.",
        highlights: {
          location: "Localizacao pratica",
          arrival: "Pagamento na chegada",
          languages: "PT, EN e ES",
        },
      },
      rooms: {
        title: "Quartos",
        copy: "Tres formatos de acomodacao para reservas diretas.",
      },
      roomDetail: {
        gallery: "Galeria",
        summary: "Resumo",
        reserve: "Ver disponibilidade",
        back: "Voltar para quartos",
      },
      about: {
        title: "Sobre",
        copy: "Uma hospedagem pequena, direta e preparada para reservas sem conta de usuario ou pagamento online no MVP.",
        contact: "Contato",
        email: "reservas@hostelapp.local",
        phone: "+55 00 00000-0000",
      },
      notFound: {
        title: "Pagina nao encontrada",
        copy: "O endereco solicitado nao existe neste app.",
        cta: "Ir para quartos",
      },
    },
  },
  en: {
    translation: {
      nav: {
        primary: "Primary navigation",
        home: "Home",
        rooms: "Rooms",
        about: "About",
        checkAvailability: "View rooms",
        openMenu: "Open menu",
        closeMenu: "Close menu",
      },
      footer: {
        location: "Independent inn, Brazil",
      },
      common: {
        from: "from",
        perNight: "per night",
        guests: "{{count}} guest",
        guests_plural: "{{count}} guests",
        capacity: "Up to {{count}} guests",
        viewRoom: "View room",
        loading: "Loading",
        retry: "Try again",
        unavailable: "Data could not be loaded right now.",
      },
      home: {
        eyebrow: "Inn, bed and breakfast, and hostel",
        title: "Hostel App",
        copy: "Compact rooms, direct service, and simple reservations for short stays.",
        primaryCta: "Explore rooms",
        secondaryCta: "About the inn",
        sectionTitle: "Choose your stay format",
        sectionCopy: "Options for solo travelers, couples, and small groups.",
        highlights: {
          location: "Practical location",
          arrival: "Pay on arrival",
          languages: "PT, EN, and ES",
        },
      },
      rooms: {
        title: "Rooms",
        copy: "Three accommodation formats for direct reservations.",
      },
      roomDetail: {
        gallery: "Gallery",
        summary: "Summary",
        reserve: "Check availability",
        back: "Back to rooms",
      },
      about: {
        title: "About",
        copy: "A small, direct accommodation prepared for reservations without user accounts or online payments in the MVP.",
        contact: "Contact",
        email: "reservations@hostelapp.local",
        phone: "+55 00 00000-0000",
      },
      notFound: {
        title: "Page not found",
        copy: "The requested address does not exist in this app.",
        cta: "Go to rooms",
      },
    },
  },
  es: {
    translation: {
      nav: {
        primary: "Navegacion principal",
        home: "Inicio",
        rooms: "Habitaciones",
        about: "Sobre",
        checkAvailability: "Ver habitaciones",
        openMenu: "Abrir menu",
        closeMenu: "Cerrar menu",
      },
      footer: {
        location: "Posada independiente, Brasil",
      },
      common: {
        from: "desde",
        perNight: "por noche",
        guests: "{{count}} huesped",
        guests_plural: "{{count}} huespedes",
        capacity: "Hasta {{count}} personas",
        viewRoom: "Ver habitacion",
        loading: "Cargando",
        retry: "Intentar de nuevo",
        unavailable: "No fue posible cargar los datos ahora.",
      },
      home: {
        eyebrow: "Posada, bed and breakfast y hostel",
        title: "Hostel App",
        copy: "Habitaciones compactas, atencion directa y reservas simples para estadias cortas.",
        primaryCta: "Conocer habitaciones",
        secondaryCta: "Sobre la posada",
        sectionTitle: "Elige el formato de tu estadia",
        sectionCopy: "Opciones para viajeros solos, parejas y grupos pequenos.",
        highlights: {
          location: "Ubicacion practica",
          arrival: "Pago al llegar",
          languages: "PT, EN y ES",
        },
      },
      rooms: {
        title: "Habitaciones",
        copy: "Tres formatos de alojamiento para reservas directas.",
      },
      roomDetail: {
        gallery: "Galeria",
        summary: "Resumen",
        reserve: "Ver disponibilidad",
        back: "Volver a habitaciones",
      },
      about: {
        title: "Sobre",
        copy: "Un alojamiento pequeno y directo, preparado para reservas sin cuenta de usuario ni pago online en el MVP.",
        contact: "Contacto",
        email: "reservas@hostelapp.local",
        phone: "+55 00 00000-0000",
      },
      notFound: {
        title: "Pagina no encontrada",
        copy: "La direccion solicitada no existe en esta app.",
        cta: "Ir a habitaciones",
      },
    },
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: window.localStorage.getItem("hostel-locale") ?? "pt",
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem("hostel-locale", language);
});

export { i18n };
