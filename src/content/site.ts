export const CONTACT_EMAIL = "digital@pginzeniring.si";

export const NAV_LINKS = [
  { id: "domov", label: "DOMOV" },
  { id: "o-nas", label: "O NAS" },
  { id: "storitve", label: "STORITVE" },
  { id: "projekti", label: "PROJEKTI" },
  { id: "proces", label: "PROCES" },
  { id: "kontakt", label: "KONTAKT" },
] as const;

export const SECTION_IDS = NAV_LINKS.map((link) => link.id);

/**
 * The four layers the hero builds a website from — PG Digital's method.
 * `spec` is the technical readout shown while the layer is being built.
 */
export const HERO_LAYERS = [
  {
    name: "Koda",
    description: "Stabilen tehnološki temelj, na katerem stoji vse ostalo.",
    label: "KODA",
    spec: "BUILD 1,2 s · 0 NAPAK",
  },
  {
    name: "Struktura",
    description: "Hierarhija, vsebina in pot uporabnika.",
    label: "STRUKTURA",
    spec: "MREŽA 12 STOLPCEV · 1440 PX",
  },
  {
    name: "Oblika",
    description: "Identiteta, tipografija, razmiki in vmesnik.",
    label: "OBLIKA",
    spec: "BRICOLAGE · #F5751E · RITEM 8 PX",
  },
  {
    name: "Izkušnja",
    description: "Gibanje, odziv in hitrost. Stran, ki deluje.",
    label: "IZKUŠNJA",
    spec: "60 FPS · LCP 0,9 s · 98 / 100",
  },
] as const;

export const SERVICES = [
  {
    name: "Spletno oblikovanje",
    panelLabel: "TIPOGRAFSKI SISTEM · 12-STOLPČNA MREŽA",
    description:
      "Vizualni sistemi, tipografija in mreže, ki znamko naredijo prepoznavno na vsakem zaslonu.",
    tags: "UX · UI · VIZUALNI SISTEMI",
    tagList: ["UX", "UI", "Vizualni sistemi"],
  },
  {
    name: "Spletni razvoj",
    panelLabel: "KODA PO MERI · ODZIVNO",
    description:
      "Hitra, varna in razširljiva koda. Next.js, TypeScript in infrastruktura, ki zdrži rast.",
    tags: "NEXT.JS · TYPESCRIPT · CMS",
    tagList: ["Next.js", "TypeScript", "CMS"],
  },
  {
    name: "E-commerce",
    panelLabel: "SPLETNA TRGOVINA · NAKUPNI TOK",
    description: "Spletne trgovine, ki prodajajo, od izdelka do plačila brez ovir.",
    tags: "TRGOVINA · PLAČILA · DOSTAVA",
    tagList: ["Trgovina", "Plačila", "Dostava"],
  },
  {
    name: "Vzdrževanje in optimizacija",
    panelLabel: "ZDRAVJE STRANI · DNEVNIK",
    description:
      "Posodobitve, meritve in izboljšave po objavi. Stran ostane hitra in varna.",
    tags: "VARNOST · SEO · HITROST",
    tagList: ["Varnost", "SEO", "Hitrost"],
  },
] as const;

export const QUALITY_METRICS = [
  { value: 100, label: "HITROST" },
  { value: 100, label: "DOSTOPNOST" },
  { value: 100, label: "SEO" },
  { value: 100, label: "PRAKSE" },
] as const;

export type Project = {
  /** Used for screenshot file names. */
  slug: string;
  title: string;
  category: string;
  year: string;
  services: string;
  languages: string;
  summary: string;
  /** Short feature tags highlighted on the showcase card. */
  highlights: readonly string[];
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
export const projectScreenshot = (slug: string, kind: "card" | "cover" | "phone") =>
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
    services: "Oblikovanje · Razvoj",
    languages: "SL · EN · DE",
    summary:
      "Spletna stran za butični studio zaščite in preobrazbe vozil BMW M, Audi RS in Porsche. Temna, filmska podoba postavi avtomobile v ospredje, pot do povpraševanja in rezervacije pa je kratka.",
    highlights: ["SI · EN · DE", "FILMSKA PODOBA", "HITRA REZERVACIJA"],
    url: "https://www.midnightautostudio.com/",
    cardView: "desktop",
    // The site crashes inside an iframe when the browser blocks third-party
    // storage (unguarded localStorage access). Re-enable once that's fixed.
    embeddable: false,
  },
  {
    slug: "pg-inzeniring",
    title: "PG Inženiring",
    category: "SPLETNA STRAN",
    year: "2026",
    services: "Oblikovanje · Razvoj",
    languages: "SL",
    summary:
      "Spletna stran za slovensko gradbeno podjetje, ki projekte vodi od projektiranja do gradnje in nadzora. Umirjena, arhitekturna podoba predstavi storitve jasno na velikem zaslonu in na telefonu.",
    highlights: ["NAMIZNA + MOBILNA", "ARHITEKTURNI UX", "PREDOGLED V ŽIVO"],
    url: "https://www.pg-inzeniring.si/",
    cardView: "phone",
    embeddable: true,
  },
];

export const STUDIO_METRICS = [
  { value: "98+", label: "LIGHTHOUSE HITROST" },
  { value: "< 24 h", label: "ODZIVNI ČAS" },
  { value: "4–6", label: "TEDNOV DO OBJAVE" },
  { value: "100 %", label: "KODA PO MERI" },
] as const;

export const PROCESS_STEPS = [
  {
    index: "01",
    name: "IDEJA",
    word: "Ideja in strategija.",
    timeline: "TEDEN 01",
    col: "1 / 2",
    description:
      "Razumemo vaš posel, ciljno občinstvo in prodajni tok. Določimo jasno strukturo vsebine, ki obiskovalca vodi do povpraševanja.",
    deliverables: ["UVODNA DELAVNICA", "INFORMACIJSKA ARHITEKTURA", "NAČRT PROJEKTA"],
  },
  {
    index: "02",
    name: "OBLIKA",
    word: "Oblikovanje sistema.",
    timeline: "TEDEN 02–03",
    col: "2 / 4",
    description:
      "Zasnujemo tipografijo, barvni sistem, interaktivne komponente in vizualno smer po meri vaše blagovne znamke — brez šablon.",
    deliverables: ["VIZUALNI SISTEM", "INTERAKTIVNI PROTOTIP", "MOBILNI PRIKAZ"],
  },
  {
    index: "03",
    name: "RAZVOJ",
    word: "Inženiring in razvoj.",
    timeline: "TEDEN 03–05",
    col: "3 / 6",
    description:
      "Obliko pretvorimo v hitro, varno Next.js in TypeScript kodo z gibanjem pri 60 FPS, tehničnim SEO in čistim urejanjem vsebin.",
    deliverables: ["NEXT.JS + TYPESCRIPT", "ANIMACIJE 60 FPS", "TEHNIČNI SEO"],
  },
  {
    index: "04",
    name: "OBJAVA",
    word: "Objava in podpora.",
    timeline: "TEDEN 06",
    col: "6 / 7",
    description:
      "Pred objavo preverimo hitrost, dostopnost in vse naprave. Stran postavimo v produkcijo ter skrbimo za posodobitve in rast.",
    deliverables: ["TESTIRANJE NA NAPRAVAH", "OBJAVA V PRODUKCIJO", "STALNA PODPORA"],
  },
] as const;

export const INQUIRY_SCOPES = [
  "Spletna stran",
  "Prenova",
  "E-commerce",
  "Vzdrževanje",
] as const;

export const INQUIRY_TIMELINES = [
  "Čim prej",
  "V 1–2 mesecih",
  "Načrtujem vnaprej",
] as const;
