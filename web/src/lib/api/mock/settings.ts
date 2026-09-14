import type { SiteSettings } from "@/domain";

/**
 * Impostazioni demo. Dati sede reali (indirizzo, telefono, orari);
 * Gli stessi valori sono mantenuti nel CMS e validati all'export.
 */
export const mockSettings: SiteSettings = {
  nomeAzienda: "Mariani",
  ragioneSociale: "Mariani S.r.l.",
  partitaIva: "01300000492",
  indirizzo: "Via Adige 3, 57025 Piombino (LI)",
  telefono: "0565 276520",
  telefonoAssistenza: "0565 276520",
  whatsapp: "390565276520",
  email: "info@marianiford.it",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Via+Adige+3+Piombino",
  mappa: { lat: 42.925, lng: 10.5236 },
  orari: [
    { giorni: "Lun–Ven", apertura: "08:30–12:30 / 14:30–18:30" },
    { giorni: "Sab–Dom", apertura: "Chiuso" },
  ],
  orariOfficina: [
    { giorni: "Lun–Ven", apertura: "08:00–12:30 / 14:00–18:00" },
    { giorni: "Sab–Dom", apertura: "Chiuso" },
  ],
  social: {
    facebook: "#",
    instagram: "#",
    whatsapp: "https://wa.me/390565276520",
  },
  heroImage: {
    src: "/hero/hero-mache.jpg",
    width: 1500,
    height: 2000,
    alt: "Ford Mustang Mach-E — showroom Mariani, Piombino",
  },
  fotoCredit:
    "Foto reali dei veicoli in vendita presso la nostra sede di Piombino — scatti di nostra proprietà.",
};
