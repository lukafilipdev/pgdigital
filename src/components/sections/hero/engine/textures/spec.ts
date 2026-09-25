import { BRAND, MUTED, TAU, type Pen, type TextStyle } from "../pen";

const TYPE_SCALE = [
  { sample: "Zgodba.", size: 7, weight: 800, label: "DISPLAY · 96" },
  { sample: "Naslov strani", size: 3.8, weight: 700, label: "H1 · 56" },
  { sample: "Podnaslov sekcije", size: 2.4, weight: 600, label: "H2 · 32" },
  { sample: "Besedilo, ki se lepo bere.", size: 1.45, weight: 400, label: "BESEDILO · 16" },
];

const SWATCHES = [
  { color: "#000000", name: "Črna", outlined: true },
  { color: "#FFFFFF", name: "Bela", outlined: false },
  { color: "#F5751E", name: "PG oranžna", outlined: false },
  { color: "#171717", name: "Grafit", outlined: true },
];

const SPACING = [4, 8, 16, 24, 48, 96];
const RADII = [0, 4, 12, Infinity];

/** The "form" layer: a design-system sheet (type, colour, components, spacing). Content scales with width. */
export function paintSpec(pen: Pen, w: number, h: number) {
  const { ctx } = pen;
  const u = w / 100;
  const m = u * 5;
  const label = (text: string, x: number, y: number, color = MUTED, align?: CanvasTextAlign) =>
    pen.text(text, x, y, { size: u * 0.95, weight: 600, color, tracking: 0.18, mono: true, align });

  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, w, h);

  label("OBLIKOVNI SISTEM", m, u * 5);
  label("VAŠA ZNAMKA — V1.0", w - m, u * 5, MUTED, "right");
  pen.hairline(m, u * 6.8, w - m, 0.1);
  label("TIPOGRAFIJA", m, u * 10);
  label("LESTVICA", u * 36, u * 10);
  label("BARVE", u * 71.5, u * 10);

  // Typeface specimen
  pen.text("Aa", m - u * 0.9, u * 28, { size: u * 21, weight: 800, tracking: -0.06 });
  pen.text("Geist", m, u * 32.4, { size: u * 2.4, weight: 700, tracking: -0.03 });
  label("VARIABILNA · 400 — 800", m, u * 34.8);
  [400, 500, 700, 800].forEach((weight, k) =>
    pen.text("Ag", m + k * u * 5.6, u * 40.6, {
      size: u * 3.6,
      weight,
      color: k === 3 ? BRAND : "#fff",
      tracking: -0.03,
    }),
  );

  // Type scale
  const scaleX = u * 36;
  const scaleEnd = u * 66;
  let y = u * 10.5;
  for (const row of TYPE_SCALE) {
    y += row.size * u * 1.02 + u * 1.5;
    pen.text(row.sample, scaleX - row.size * u * 0.04, y, {
      size: row.size * u,
      weight: row.weight,
      color: row.weight === 400 ? "#b3b3b3" : "#fff",
      tracking: row.size > 2 ? -0.05 : 0,
    });
    label(row.label, scaleEnd, y, "#6d6d6d", "right");
    pen.hairline(scaleX, y + u * 1.1, scaleEnd, 0.08);
  }
  label("VRSTIČNI RAZMIK 0.92 · SLEDENJE −0.055 EM", scaleX, u * 38, "#6d6d6d");

  // Colour swatches
  SWATCHES.forEach(({ color, name, outlined }, k) => {
    const cx = u * (75.2 + (k % 2) * 12.5);
    const cy = u * (16 + Math.floor(k / 2) * 13.5);
    const r = u * 3.7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    if (outlined) {
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    pen.text(name, cx - r, cy + u * 6.2, { size: u * 1.25, weight: 600 });
    pen.text(color, cx - r, cy + u * 8, { size: u * 0.9, weight: 500, color: MUTED, tracking: 0.1, mono: true });
  });

  // Components
  pen.hairline(m, u * 44, w - m, 0.1);
  label("KOMPONENTE", m, u * 47.2);

  const pill = (x: number, py: number, text: string, fill: string | null, color: string, border?: string) => {
    const style: TextStyle = { size: u * 1.25, weight: 600, color };
    const f = style.size;
    const pw = pen.measure(text, style) + f * 2.6;
    const ph = f * 3;
    if (fill) {
      ctx.fillStyle = fill;
      pen.roundRect(x, py, pw, ph, ph / 2);
      ctx.fill();
    }
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      pen.roundRect(x + 0.5, py + 0.5, pw - 1, ph - 1, ph / 2);
      ctx.stroke();
    }
    pen.text(text, x + f * 1.3, py + ph * 0.64, style);
    return pw;
  };

  const rowY = u * 49.6;
  let x = m;
  x += pill(x, rowY, "Začnimo projekt  →", BRAND, "#000") + u * 1.4;
  x += pill(x, rowY, "Več o nas", null, "#fff", "rgba(255,255,255,.35)") + u * 1.4;
  label("HOVER", x, rowY - u * 0.8, BRAND);
  x += pill(x, rowY, "Pišite nam", "#fff", "#000") + u * 2.4;

  // Toggle
  ctx.fillStyle = BRAND;
  pen.roundRect(x, rowY + u * 0.7, u * 4.6, u * 2.4, u * 1.2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x + u * 3.4, rowY + u * 1.9, u * 0.9, 0, TAU);
  ctx.fill();

  // Input with caret
  const inputX = u * 61;
  const email = "info@vasaznamka.si";
  const emailStyle: TextStyle = { size: u * 1.5, weight: 500 };
  label("E-POŠTA", inputX, rowY + u * 0.2);
  pen.text(email, inputX, rowY + u * 3, emailStyle);
  ctx.fillStyle = BRAND;
  ctx.fillRect(inputX, rowY + u * 4.1, u * 17, 2);
  ctx.fillRect(inputX + pen.measure(email, emailStyle) + u * 0.3, rowY + u * 1.6, 2, u * 1.8);

  // Corner radii
  RADII.forEach((radius, k) => {
    const rx = u * (82 + k * 3.4);
    const ry = rowY + u * 0.4;
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1;
    pen.roundRect(rx + 0.5, ry + 0.5, u * 2.4, u * 2.4, Number.isFinite(radius) ? radius * u * 0.08 : u * 1.2);
    ctx.stroke();
    label(Number.isFinite(radius) ? String(radius) : "∞", rx + u * 1.2, ry + u * 4.2, "#6d6d6d", "center");
  });

  // Spacing scale
  label("RAZMIKI", m, u * 57.6);
  let spacingX = m + u * 7.5;
  for (const value of SPACING) {
    const barW = value * u * 0.09;
    ctx.fillStyle = "rgba(245,117,30,.85)";
    ctx.fillRect(spacingX, u * 56.6, barW, u * 1.2);
    label(String(value), spacingX, u * 59.6, "#6d6d6d");
    spacingX += Math.max(barW, u * 2) + u * 1.6;
  }
  label("MREŽA 12 × 24 PX", w - m, u * 57.6, "#6d6d6d", "right");
}
