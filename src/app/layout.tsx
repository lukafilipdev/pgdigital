import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const bricolageDisplay = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "PG DIGITAL — Spletna stran, ki si jo vaša znamka zasluži.",
  description:
    "Digitalni studio PG INŽENIRING. Oblikujemo in razvijamo hitre spletne strani in e-trgovine po meri za podjetja v Sloveniji in EU. Ista natančnost. Ista odgovornost. Nov medij.",
  keywords: [
    "PG Digital",
    "PG Inženiring",
    "spletno oblikovanje",
    "izdelava spletnih strani",
    "Next.js razvoj",
    "spletne trgovine",
    "Slovenija",
    "Prekmurje",
  ],
  openGraph: {
    title: "PG DIGITAL — Spletno oblikovanje in razvoj po meri",
    description:
      "Gradimo v fizičnem svetu. Zdaj gradimo tudi digitalno. Spletne strani in e-trgovine po meri z inženirsko natančnostjo.",
    type: "website",
    locale: "sl_SI",
    siteName: "PG DIGITAL — PG INŽENIRING",
  },
  twitter: {
    card: "summary_large_image",
    title: "PG DIGITAL — Spletna stran, ki si jo vaša znamka zasluži.",
    description:
      "Oblikujemo in razvijamo spletne strani za podjetja, ki želijo izstopati.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const STUDIO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "PG DIGITAL — PG INŽENIRING",
  description:
    "Spletno oblikovanje, razvoj po meri (Next.js, TypeScript), e-commerce in vzdrževanje spletnih strani.",
  email: "digital@pginzeniring.si",
  areaServed: ["SI", "EU"],
  address: {
    "@type": "PostalAddress",
    addressRegion: "Prekmurje",
    addressCountry: "SI",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sl"
      className={`${bricolageDisplay.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STUDIO_SCHEMA) }}
        />
        {children}
      </body>
    </html>
  );
}
