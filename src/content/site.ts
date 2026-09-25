export const CONTACT_EMAIL = "digital@pginzeniring.si";

export const NAV_LINKS = [
  { id: "domov", label: "DOMOV" },
  { id: "storitve", label: "STORITVE" },
  { id: "projekti", label: "PROJEKTI" },
  { id: "proces", label: "PROCES" },
  { id: "o-nas", label: "O NAS" },
  { id: "kontakt", label: "KONTAKT" },
] as const;

export const SECTION_IDS = NAV_LINKS.map((link) => link.id);

/** The four layers the hero peels a website into while scrolling. */
export const HERO_LAYERS = [
  { name: "Koda", description: "Temelj, na katerem stoji vse ostalo.", label: "KODA" },
  { name: "Struktura", description: "Hierarhija, vsebina in pot uporabnika.", label: "STRUKTURA" },
  { name: "Oblika", description: "Tipografija, barva in ritem.", label: "OBLIKA" },
  { name: "Izkušnja", description: "Gibanje, odziv in hitrost. Stran, ki deluje.", label: "IZKUŠNJA" },
] as const;

export const SERVICES = [
  {
    name: "Spletno oblikovanje",
    description:
      "Vizualni sistemi, tipografija in mreže, ki znamko naredijo prepoznavno na vsakem zaslonu.",
    tags: "UX · UI · VIZUALNI SISTEMI",
  },
  {
    name: "Spletni razvoj",
    description:
      "Hitra, varna in razširljiva koda. Next.js, TypeScript in infrastruktura, ki zdrži rast.",
    tags: "NEXT.JS · TYPESCRIPT · CMS",
  },
  {
    name: "E-commerce",
    description: "Spletne trgovine, ki prodajajo — od izdelka do plačila brez ovir.",
    tags: "TRGOVINA · PLAČILA · ZALOGA",
  },
  {
    name: "Vzdrževanje in optimizacija",
    description:
      "Posodobitve, meritve in izboljšave po objavi. Stran ostane hitra in varna.",
    tags: "HITROST · SEO · PODPORA",
  },
] as const;

export const QUALITY_METRICS = [
  { value: 98, label: "HITROST" },
  { value: 100, label: "DOSTOPNOST" },
  { value: 100, label: "SEO" },
] as const;

export type Project = {
  /** Used for screenshot file names. */
  slug: string;
  title: string;
  category: string;
  year: string;
  services: string;
  summary: string;
  url: string;
  /** How the project card shows the site: a desktop or a phone screenshot. */
  cardView: CardView;
  /**
   * Whether the live site may be shown in an iframe, i.e. it sends no
   * `X-Frame-Options` / CSP `frame-ancestors` that forbid it.
   */
  embeddable: boolean;
};

/** Screenshots are generated from each project's `url` by `npm run capture`. */
export const projectScreenshot = (slug: string, kind: "card" | "cover") =>
  `/images/projects/${slug}-${kind}.png`;

export type Shot = {
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  /** Emulate a phone (mobile user agent, touch) so sites serve their mobile layout. */
  mobile?: boolean;
};

export type CardView = "desktop" | "phone";

/**
 * Shots taken by `scripts/capture-projects.ts`. Project cards take the aspect
 * ratio of their shot, so screenshots are always shown uncropped. The cover
 * fills the case-study header (~2:1): it's shown while the live preview loads,
 * or instead of it for sites that can't be embedded.
 */
export const SCREENSHOTS: Record<CardView | "cover", Shot> = {
  desktop: { viewport: { width: 1440, height: 990 }, deviceScaleFactor: 2 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, mobile: true },
  cover: { viewport: { width: 1440, height: 720 }, deviceScaleFactor: 2 },
};

export const PROJECTS: Project[] = [
  {
    slug: "midnight-auto-studio",
    title: "Midnight Auto Studio",
    category: "SPLETNA STRAN",
    year: "2026",
    services: "OBLIKOVANJE · RAZVOJ",
    summary:
      "Spletna stran za butični studio zaščite in preobrazbe vozil BMW M, Audi RS in Porsche. Temna, filmska podoba postavi avtomobile v ospredje, pot do povpraševanja in rezervacije pa je kratka — v slovenščini, angleščini in nemščini.",
    url: "https://www.midnightautostudio.com/",
    cardView: "desktop",
    // The site crashes inside an iframe when the browser blocks third-party
    // storage (unguarded localStorage access). Re-enable once that's fixed.
    embeddable: false,
  },
  {
    slug: "pg-inzeniring",
    title: "PG INŽENIRING",
    category: "SPLETNA STRAN",
    year: "2026",
    services: "OBLIKOVANJE · RAZVOJ",
    summary:
      "Spletna stran za slovensko gradbeno podjetje, ki projekte vodi od projektiranja do gradnje in nadzora. Umirjena, arhitekturna podoba predstavi storitve jasno — tudi na telefonu.",
    url: "https://pging.vercel.app/",
    cardView: "phone",
    embeddable: true,
  },
];

export const PROCESS_STEPS = [
  { name: "IDEJA", word: "Ideja." },
  { name: "OBLIKA", word: "Oblika." },
  { name: "RAZVOJ", word: "Razvoj." },
  { name: "OBJAVA", word: "Objava." },
] as const;
