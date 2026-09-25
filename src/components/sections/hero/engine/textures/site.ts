import { BRAND, MUTED, TAU, type Pen, type Rect, type TextStyle } from "../pen";
import { paintScene } from "./scene";

/** Bounding boxes of the painted elements, used by the "inspect" layer. */
export type SiteGeometry = {
  nav: Rect;
  title: Rect;
  paragraph: Rect;
  button: Rect;
  image: Rect;
  cards: Rect[];
  /** 1% of the shorter side. */
  unit: number;
  margin: number;
};

const CARDS = [
  ["Vaša storitev", "PONUDBA"],
  ["Vaš izdelek", "TRGOVINA"],
  ["Vaša referenca", "ZGODBE STRANK"],
] as const;

/** Paints a generic landing page ("Tu stoji vaša zgodba.") into `pen`. */
export function paintSite(pen: Pen, w: number, h: number, withPointer: boolean): SiteGeometry {
  const { ctx } = pen;
  const portrait = w < h;
  const u = Math.min(w, h) / 100;
  const m = w * (portrait ? 0.07 : 0.055);

  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, w, h);

  // Navigation
  const navH = h * (portrait ? 0.075 : 0.1);
  const nav: Rect = [m, navH * 0.18, w - 2 * m, navH * 0.64];
  const brandSize = u * (portrait ? 4.2 : 2.5);
  const brand: TextStyle = { size: brandSize, weight: 800, tracking: -0.045 };
  pen.text("Vaša znamka", m, navH * 0.5 + brandSize * 0.36, brand);
  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(
    m + pen.measure("Vaša znamka", brand) + brandSize * 0.22,
    navH * 0.5 + brandSize * 0.28,
    brandSize * 0.1,
    0,
    TAU,
  );
  ctx.fill();

  const pillSize = u * (portrait ? 2.9 : 1.35);
  const pill: TextStyle = { size: pillSize, weight: 600 };
  const pillW = pen.measure("Pišite nam", pill) + pillSize * 2.4;
  const pillH = pillSize * 2.5;
  const pillX = w - m - pillW;
  const pillY = navH * 0.5 - pillH / 2;
  ctx.fillStyle = "#fff";
  pen.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  pen.text("Pišite nam", pillX + pillSize * 1.2, pillY + pillH * 0.66, { ...pill, color: "#000" });

  if (!portrait) {
    const link: TextStyle = { size: pillSize, weight: 500, color: "#bdbdbd" };
    let linkX = pillX - pillSize * 2.4;
    for (const label of ["Novice", "Studio", "Delo"]) {
      linkX -= pen.measure(label, link);
      pen.text(label, linkX, pillY + pillH * 0.66, link);
      linkX -= pillSize * 2.2;
    }
  }
  pen.hairline(0, navH, w, 0.07);

  // Headline
  const T = portrait ? w * 0.125 : Math.min(w * 0.074, h * 0.125);
  const titleY = h * (portrait ? 0.15 : 0.24);
  pen.text("VAŠA DEJAVNOST · VAŠE MESTO", m, titleY - T * 0.3, {
    size: u * (portrait ? 2.2 : 1.1),
    weight: 600,
    color: MUTED,
    tracking: 0.16,
    mono: true,
  });
  const headline: TextStyle = { size: T, weight: 800, tracking: -0.055 };
  ["Tu stoji", "vaša", "zgodba"].forEach((line, k) =>
    pen.text(line, m - T * 0.04, titleY + T * (0.86 + k * 0.9), headline),
  );
  const lastLineW = pen.measure("zgodba", headline);
  pen.text(".", m - T * 0.04 + lastLineW, titleY + T * 2.66, { size: T, weight: 800, color: BRAND });
  const title: Rect = [
    m - T * 0.06,
    titleY + T * 0.08,
    Math.max(pen.measure("Tu stoji", headline), lastLineW + T * 0.3) + T * 0.1,
    T * 2.72,
  ];

  // Paragraph
  let y = titleY + T * 2.66 + u * (portrait ? 6 : 5.2);
  const bodySize = u * (portrait ? 3 : 1.55);
  const body: TextStyle = { size: bodySize, weight: 400, color: "#a6a6a6" };
  const bodyLines = ["Kratko, jasno sporočilo o tem,", "kaj ponujate in komu."];
  bodyLines.forEach((line, k) => pen.text(line, m, y + k * bodySize * 1.45, body));
  const paragraph: Rect = [m, y - bodySize, pen.measure(bodyLines[0], body), bodySize * 2.6];
  y += bodySize * 1.45 + u * (portrait ? 4.4 : 3);

  // Buttons
  const buttonSize = u * (portrait ? 2.9 : 1.4);
  const buttonText: TextStyle = { size: buttonSize, weight: 600 };
  const buttonLabel = "Poglej ponudbo  →";
  const buttonW = pen.measure(buttonLabel, buttonText) + buttonSize * 2.6;
  const buttonH = buttonSize * 3;
  ctx.fillStyle = BRAND;
  pen.roundRect(m, y, buttonW, buttonH, buttonH / 2);
  ctx.fill();
  pen.text(buttonLabel, m + buttonSize * 1.3, y + buttonH * 0.64, { ...buttonText, color: "#000" });
  const linkX = m + buttonW + buttonSize * 1.8;
  pen.text("O nas", linkX, y + buttonH * 0.64, buttonText);
  ctx.fillStyle = "rgba(255,255,255,.5)";
  ctx.fillRect(linkX, y + buttonH * 0.64 + buttonSize * 0.35, pen.measure("O nas", buttonText), 1);
  const button: Rect = [m, y, buttonW, buttonH];

  // Hero image
  const imageTop = y + buttonH + u * 6;
  const image: Rect = portrait
    ? [m, imageTop, w - 2 * m, h * 0.8 - imageTop]
    : [w * 0.52, h * 0.19, w - m - w * 0.52, h * 0.55];
  paintScene(ctx, ...image, 0);
  const caption: TextStyle = {
    size: u * (portrait ? 2 : 0.95),
    weight: 600,
    color: "#fff",
    tracking: 0.16,
    mono: true,
  };
  const captionY = image[1] + image[3] - u * 1.8;
  pen.text("VAŠA FOTOGRAFIJA", image[0] + u * 1.8, captionY, caption);
  pen.text("01 — 12", image[0] + image[2] - u * 1.8, captionY, {
    ...caption,
    color: "rgba(255,255,255,.7)",
    align: "right",
  });

  // Cards
  const count = portrait ? 2 : 3;
  const cardY = portrait ? h * 0.835 : h * 0.8;
  const cardH = portrait ? h * 0.13 : h * 0.14;
  const gap = u * (portrait ? 3 : 1.8);
  const cardW = (w - 2 * m - gap * (count - 1)) / count;
  const cardTitle: TextStyle = { size: u * (portrait ? 2.8 : 1.5), weight: 700, tracking: -0.03 };
  const cardMeta: TextStyle = {
    size: u * (portrait ? 1.8 : 0.85),
    weight: 600,
    color: MUTED,
    tracking: 0.12,
    mono: true,
  };
  const tf = cardTitle.size;
  const mf = cardMeta.size;
  const cards: Rect[] = [];

  for (let k = 0; k < count; k++) {
    const x = m + k * (cardW + gap);
    const [name, meta] = CARDS[k];
    pen.hairline(x, cardY, x + cardW, 0.12);

    if (portrait) {
      const thumbH = cardH * 0.56;
      const textY = cardY + u * 2 + thumbH + tf * 1.4;
      paintScene(ctx, x, cardY + u * 2, cardW, thumbH, k + 1);
      pen.text(name, x, textY, cardTitle);
      pen.text(meta, x, textY + mf * 2, cardMeta);
    } else {
      const thumbH = cardH - u * 2.2;
      const textX = x + thumbH * 1.35 + u * 1.8;
      const textY = cardY + u * 1.4 + tf * 1.1;
      paintScene(ctx, x, cardY + u * 1.4, thumbH * 1.35, thumbH, k + 1);
      pen.text(name, textX, textY, cardTitle);
      pen.text(meta, textX, textY + mf * 2.2, cardMeta);
      pen.text("→", x + cardW - tf, textY, {
        size: tf,
        weight: 500,
        color: k === 0 ? BRAND : "#6d6d6d",
      });
    }
    cards.push([x, cardY, cardW, cardH]);
  }

  if (withPointer) paintPointer(ctx, m + buttonW * 0.78, y + buttonH * 0.7, u);

  return { nav, title, paragraph, button, image, cards, unit: u, margin: m };
}

/** Classic arrow cursor hovering the primary button. */
function paintPointer(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
  const s = u * 2.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + s * 1.45);
  ctx.lineTo(x + s * 0.38, y + s * 1.08);
  ctx.lineTo(x + s * 0.66, y + s * 1.62);
  ctx.lineTo(x + s * 0.86, y + s * 1.52);
  ctx.lineTo(x + s * 0.6, y + s);
  ctx.lineTo(x + s * 1.08, y + s);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = Math.max(1, u * 0.15);
  ctx.stroke();
}
