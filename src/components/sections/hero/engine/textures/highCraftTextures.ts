import { BRAND, MUTED, TAU, type Pen, type TextStyle } from "../pen";

export const TEX_W = 2048;
export const TEX_H = 1280;

export type SiteMediaAssets = {
  hero?: HTMLImageElement;
  cards?: (HTMLImageElement | undefined)[];
};

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return false;

  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
  return true;
}

type CodeToken = {
  text: string;
  tone: "keyword" | "plain" | "accent" | "comment" | "string";
};

const CODE_LINES: CodeToken[][] = [
  [
    { text: "import", tone: "keyword" },
    { text: " { Hero, Grid } ", tone: "plain" },
    { text: "from", tone: "keyword" },
    { text: " './vasa-znamka';", tone: "string" },
  ],
  [
    { text: "export default function", tone: "keyword" },
    { text: " Stran() {", tone: "plain" },
  ],
  [
    { text: "  const", tone: "keyword" },
    { text: " [lens, setLens] = useSpring(", tone: "plain" },
    { text: "0.08", tone: "accent" },
    { text: ");", tone: "plain" },
  ],
  [
    { text: "  useScroll(ref, { pin: ", tone: "plain" },
    { text: "true", tone: "keyword" },
    { text: ", smooth: ", tone: "plain" },
    { text: "0.09", tone: "accent" },
    { text: " });", tone: "plain" },
  ],
  [
    { text: "  return", tone: "keyword" },
    { text: " (", tone: "plain" },
  ],
  [
    { text: "    <Hero ", tone: "plain" },
    { text: "naslov", tone: "accent" },
    { text: "=", tone: "plain" },
    { text: '"Tu stoji vaša zgodba."', tone: "string" },
    { text: " />", tone: "plain" },
  ],
  [
    { text: "    <Mreza ", tone: "plain" },
    { text: "stolpci", tone: "accent" },
    { text: "={12} ", tone: "plain" },
    { text: "razmik", tone: "accent" },
    { text: "={24} />", tone: "plain" },
  ],
  [
    { text: "    <Gumb ", tone: "plain" },
    { text: "barva", tone: "accent" },
    { text: "=", tone: "plain" },
    { text: '"--pg-orange"', tone: "string" },
    { text: ">Poglej ponudbo</Gumb>", tone: "plain" },
  ],
  [{ text: "  );", tone: "plain" }],
  [{ text: "}", tone: "plain" }],
  [{ text: "// build 1,2 s · 0 napak · 98 / 100", tone: "comment" }],
];

export const CODE_TOTAL_CHARS = CODE_LINES.reduce(
  (sum, tokens) => sum + tokens.reduce((lineSum, tok) => lineSum + tok.text.length, 0),
  0,
);

const TOKEN_COLOR: Record<CodeToken["tone"], string> = {
  keyword: BRAND,
  accent: "#ffb275",
  string: "#ffffff",
  plain: "rgba(255,255,255,0.86)",
  comment: "rgba(245,117,30,0.82)",
};

/**
 * Layer 01 — KODA (painted in logical 1024×640 coords scaled 2× to 2048×1280).
 * Crisp dark editor with 12-column grid, live-typed TSX and build telemetry sidebar.
 */
export function paintHighCraftCode(pen: Pen, typedChars: number, caretVisible: boolean) {
  const { ctx } = pen;
  const W = 1024;
  const H = 640;

  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, W, H);

  // Subtle 12-column architectural grid
  const padX = 52;
  const gap = 14;
  const colW = (W - padX * 2 - gap * 11) / 12;
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(padX + i * (colW + gap), 0, colW, H);
  }

  // Subtle warm top-left ambient light
  const glow = ctx.createRadialGradient(140, 80, 10, 140, 80, 380);
  glow.addColorStop(0, "rgba(245,117,30,0.12)");
  glow.addColorStop(1, "rgba(245,117,30,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top editor bar
  const barH = 48;
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.fillRect(0, 0, W, barH);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, barH, W, 1.5);

  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(28 + k * 16, barH / 2, 4.2, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(80, 16, 1.5, 16);
  pen.text("src/app/stran.tsx", 96, 29, { size: 12, weight: 600, color: "rgba(255,255,255,0.94)", tracking: 0.08, mono: true });

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  pen.roundRect(244, 15, 42, 18, 3);
  ctx.fill();
  pen.text("TSX", 265, 28, { size: 10, weight: 700, color: "rgba(255,255,255,0.7)", tracking: 0.1, mono: true, align: "center" });

  pen.text("NEXT.JS 16", W - 126, 29, { size: 11, weight: 600, color: "rgba(255,255,255,0.58)", tracking: 0.12, mono: true, align: "right" });
  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(W - 102, 24, 3.5, 0, TAU);
  ctx.fill();
  pen.text("0 NAPAK", W - 26, 29, { size: 11, weight: 700, color: BRAND, tracking: 0.12, mono: true, align: "right" });

  // Sidebar separator
  const sideX = W - 246;
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.fillRect(sideX, barH, W - sideX, H - barH);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(sideX, barH, 1.5, H - barH);

  // Code lines
  let remaining = Math.max(0, typedChars);
  let caretLine = typedChars >= CODE_TOTAL_CHARS ? 2 : -1;
  const startY = 122;
  const lineH = 42;
  const codeSize = 17;

  for (let j = 0; j < CODE_LINES.length && (j === 0 || remaining > 0 || j <= caretLine); j++) {
    const y = startY + j * lineH;
    pen.text(String(j + 1).padStart(2, "0"), 46, y, {
      size: 13.5,
      weight: 600,
      color: "rgba(255,255,255,0.28)",
      mono: true,
      align: "right",
    });

    let x = 70;
    for (const tok of CODE_LINES[j]) {
      if (remaining <= 0) break;
      const seg = tok.text.slice(0, remaining);
      remaining -= seg.length;
      const style: TextStyle = { size: codeSize, weight: 500, color: TOKEN_COLOR[tok.tone], mono: true };
      pen.text(seg, x, y, style);
      x += pen.measure(seg, style);
    }

    if (typedChars < CODE_TOTAL_CHARS && remaining <= 0 && caretLine < 0) caretLine = j;
    if (j === caretLine && caretVisible) {
      ctx.fillStyle = BRAND;
      ctx.fillRect(x + 2, y - 14, 9.5, 19);
    }
  }

  // Right telemetry sidebar
  const sx = sideX + 26;
  const sw = W - sx - 26;
  pen.text("KOMPILACIJA", sx, 84, { size: 11, weight: 700, color: "rgba(255,255,255,0.48)", tracking: 0.16, mono: true });

  const metrics = [
    { label: "ČAS GRADNJE", value: "1,2 s", accent: true },
    { label: "TIPOSKOP", value: "STRICT ✓", accent: false },
    { label: "PAKET (GZIP)", value: "42,4 kB", accent: false },
    { label: "LCP CILJ", value: "< 0,9 s", accent: false },
  ];
  metrics.forEach((m, idx) => {
    const my = 122 + idx * 72;
    pen.text(m.label, sx, my, { size: 10.5, weight: 600, color: "rgba(255,255,255,0.46)", tracking: 0.14, mono: true });
    pen.text(m.value, sx, my + 24, {
      size: 17,
      weight: 700,
      color: m.accent ? BRAND : "rgba(255,255,255,0.95)",
      mono: true,
    });
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.fillRect(sx, my + 40, sw, 1.5);
  });

  // Lighthouse card
  const lhY = 474;
  ctx.fillStyle = "rgba(245,117,30,0.09)";
  pen.roundRect(sx, lhY, sw, 126, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(245,117,30,0.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  pen.text("LIGHTHOUSE", sx + 16, lhY + 28, { size: 10.5, weight: 700, color: BRAND, tracking: 0.14, mono: true });
  pen.text("PROD", sx + sw - 16, lhY + 28, { size: 10.5, weight: 700, color: BRAND, tracking: 0.14, mono: true, align: "right" });
  pen.text("98", sx + 16, lhY + 78, { size: 38, weight: 800, color: "#fff", tracking: -0.04 });
  pen.text("/ 100", sx + 68, lhY + 78, { size: 14, weight: 600, color: "rgba(255,255,255,0.5)", mono: true });

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  pen.roundRect(sx + 16, lhY + 98, sw - 32, 6, 3);
  ctx.fill();
  ctx.fillStyle = BRAND;
  pen.roundRect(sx + 16, lhY + 98, (sw - 32) * 0.98, 6, 3);
  ctx.fill();
}

/** Layer 02 — STRUKTURA: Architectural Figma wireframe blueprint with 12-col grid & redlines. */
export function paintHighCraftStructure(pen: Pen) {
  const { ctx } = pen;
  const W = 1024;
  const H = 640;
  const m = 56;

  ctx.fillStyle = "#090909";
  ctx.fillRect(0, 0, W, H);

  // 12-column translucent orange bands
  const gap = 14;
  const colW = (W - m * 2 - gap * 11) / 12;
  ctx.fillStyle = "rgba(245,117,30,0.065)";
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(m + i * (colW + gap), 0, colW, H);
  }

  const tag = (label: string, x: number, y: number, selected = false) => {
    const style: TextStyle = { size: 10, weight: 700, color: "#000", tracking: 0.12, mono: true };
    const tw = pen.measure(label, style) + 14;
    const th = 20;
    ctx.fillStyle = selected ? BRAND : "rgba(255,255,255,0.94)";
    pen.roundRect(x, y - th - 3, tw, th, 2);
    ctx.fill();
    pen.text(label, x + 7, y - 9, style);
  };

  const box = (x: number, y: number, bw: number, bh: number, label = "", selected = false) => {
    ctx.fillStyle = selected ? "rgba(245,117,30,0.06)" : "rgba(255,255,255,0.03)";
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = selected ? BRAND : "rgba(255,255,255,0.42)";
    ctx.lineWidth = selected ? 2.2 : 1.5;
    ctx.strokeRect(x, y, bw, bh);
    if (label) tag(label, x, y, selected);
  };

  // Nav box
  box(m, 26, W - m * 2, 46, "NAVIGACIJA · STICKY");
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(m + 18, 44, 102, 10);
  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(m + 132, 49, 4, 0, TAU);
  ctx.fill();
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(W - m - 240 + k * 48, 45, 32, 8);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = 1.5;
  pen.roundRect(W - m - 96, 37, 82, 24, 12);
  ctx.stroke();

  // Redline helper
  const measure = (x0: number, y0: number, x1: number, y1: number, text: string) => {
    const vertical = x0 === x1;
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    if (vertical) {
      ctx.moveTo(x0 - 5, y0);
      ctx.lineTo(x0 + 5, y0);
      ctx.moveTo(x0 - 5, y1);
      ctx.lineTo(x0 + 5, y1);
    } else {
      ctx.moveTo(x0, y0 - 5);
      ctx.lineTo(x0, y0 + 5);
      ctx.moveTo(x1, y0 - 5);
      ctx.lineTo(x1, y0 + 5);
    }
    ctx.stroke();

    const style: TextStyle = { size: 10.5, weight: 700, color: "#000", mono: true, align: "center" };
    const lw = pen.measure(text, style) + 12;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    ctx.fillStyle = BRAND;
    pen.roundRect(cx - lw / 2, cy - 9.5, lw, 19, 2);
    ctx.fill();
    pen.text(text, cx, cy + 4, style);
  };

  // Selected headline
  const hx = m;
  const hy = 122;
  const hw = 370;
  const hh = 178;
  box(hx, hy, hw, hh, "NASLOV · BRICOLAGE 800", true);
  ["Tu stoji", "vaša", "zgodba"].forEach((line, k) => {
    pen.text(line, hx + 18, hy + 52 + k * 48, {
      size: 50,
      weight: 800,
      color: "rgba(255,255,255,0.28)",
      tracking: -0.055,
    });
  });
  pen.text(".", hx + 18 + pen.measure("zgodba", { size: 50, weight: 800, tracking: -0.055 }), hy + 148, {
    size: 50,
    weight: 800,
    color: "rgba(245,117,30,0.8)",
  });

  // 8 resize handles
  for (const [a, b] of [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]]) {
    const px = hx + hw * a - 5;
    const py = hy + hh * b - 5;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 1.8;
    ctx.fillRect(px, py, 10, 10);
    ctx.strokeRect(px, py, 10, 10);
  }
  const sizeBadge = "512 × 288";
  const sbStyle: TextStyle = { size: 10.5, weight: 700, color: "#000", mono: true, align: "center" };
  const sbW = pen.measure(sizeBadge, sbStyle) + 14;
  ctx.fillStyle = BRAND;
  pen.roundRect(hx + hw / 2 - sbW / 2, hy + hh + 9, sbW, 20, 2);
  ctx.fill();
  pen.text(sizeBadge, hx + hw / 2, hy + hh + 23, sbStyle);

  // Body box
  const bx = m;
  const by = 344;
  const bw = 310;
  const bh = 54;
  box(bx, by, bw, bh, "BESEDILO · 16 PX");
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(bx + 16, by + 16, 250, 9);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(bx + 16, by + 32, 195, 9);

  // CTA button with diagonal padding hatch
  const cxBtn = m + 10;
  const cyBtn = 442;
  const cwBtn = 172;
  const chBtn = 40;
  const pad = 10;

  ctx.save();
  ctx.beginPath();
  ctx.rect(cxBtn - pad, cyBtn - pad, cwBtn + pad * 2, chBtn + pad * 2);
  ctx.rect(cxBtn, cyBtn, cwBtn, chBtn);
  ctx.clip("evenodd");
  ctx.strokeStyle = "rgba(245,117,30,0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = -chBtn - pad * 2; k < cwBtn + pad * 2; k += 8) {
    ctx.moveTo(cxBtn - pad + k, cyBtn + chBtn + pad);
    ctx.lineTo(cxBtn - pad + k + chBtn + pad * 2, cyBtn - pad);
  }
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "rgba(245,117,30,0.75)";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cxBtn - pad, cyBtn - pad, cwBtn + pad * 2, chBtn + pad * 2);
  ctx.setLineDash([]);

  ctx.fillStyle = "#090909";
  ctx.fillRect(cxBtn, cyBtn, cwBtn, chBtn);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cxBtn, cyBtn, cwBtn, chBtn);
  pen.text("GUMB · CTA", cxBtn + cwBtn / 2, cyBtn + 24, {
    size: 11,
    weight: 700,
    color: "rgba(255,255,255,0.9)",
    tracking: 0.14,
    mono: true,
    align: "center",
  });

  // Right Hero Media Wireframe
  const mx = 532;
  const my = 122;
  const mw = W - m - mx;
  const mh = 368;
  box(mx, my, mw, mh, "SLIKA · 16:10 · LAZY");
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.lineTo(mx + mw, my + mh);
  ctx.moveTo(mx + mw, my);
  ctx.lineTo(mx, my + mh);
  ctx.stroke();

  ctx.fillStyle = "rgba(9,9,11,0.9)";
  ctx.fillRect(mx + mw / 2 - 86, my + mh / 2 - 42, 172, 84);
  ctx.strokeStyle = "rgba(245,117,30,0.65)";
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(mx + mw / 2 - 86, my + mh / 2 - 42, 172, 84);
  ctx.setLineDash([]);
  pen.text("OKVIR MEDIJA", mx + mw / 2, my + mh / 2 - 4, {
    size: 12,
    weight: 700,
    color: "rgba(255,255,255,0.88)",
    tracking: 0.16,
    mono: true,
    align: "center",
  });
  pen.text("620 × 402 PX", mx + mw / 2, my + mh / 2 + 18, {
    size: 11,
    weight: 700,
    color: BRAND,
    tracking: 0.12,
    mono: true,
    align: "center",
  });

  // Redlines
  measure(hx + hw + 22, 72, hx + hw + 22, hy, "64");
  measure(bx + bw + 20, by + bh, bx + bw + 20, cyBtn, "32");
  measure(cxBtn + cwBtn + 26, cyBtn + chBtn / 2, mx, cyBtn + chBtn / 2, "48");

  // Bottom 3 cards
  const cardGap = 20;
  const cardW = (W - m * 2 - cardGap * 2) / 3;
  const cardY = 532;
  const cardH = 82;
  for (let k = 0; k < 3; k++) {
    const cxCard = m + k * (cardW + cardGap);
    box(cxCard, cardY, cardW, cardH, k === 0 ? "KARTICA × 3" : "");
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(cxCard + 12, cardY + 12, 82, cardH - 24);
    ctx.strokeRect(cxCard + 12, cardY + 12, 82, cardH - 24);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(cxCard + 108, cardY + 24, cardW - 130, 10);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(cxCard + 108, cardY + 44, (cardW - 130) * 0.62, 8);
  }
}

/** Layer 03 — OBLIKA: Razor-sharp Design System sheet (typography, swatches, controls, spacing). */
export function paintHighCraftForm(pen: Pen) {
  const { ctx } = pen;
  const W = 1024;
  const H = 640;
  const m = 50;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const label = (text: string, x: number, y: number, color = MUTED, align?: CanvasTextAlign) =>
    pen.text(text, x, y, { size: 11, weight: 700, color, tracking: 0.16, mono: true, align });

  label("OBLIKOVNI SISTEM", m, 44);
  label("VAŠA ZNAMKA · V1.0", W - m, 44, MUTED, "right");
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(m, 58, W - m * 2, 1.5);

  label("TIPOGRAFIJA", m, 92);
  label("LESTVICA", 358, 92);
  label("BARVE", 734, 92);

  // Typeface specimen
  pen.text("Aa", m - 8, 232, { size: 148, weight: 800, color: "#fff", tracking: -0.065 });
  pen.text("Bricolage", m, 272, { size: 24, weight: 700, color: "#fff", tracking: -0.03 });
  label("VARIABILNA · 400 DO 800", m, 294);
  [400, 500, 700, 800].forEach((weight, k) => {
    const wx = m + k * 62;
    pen.text("Ag", wx, 348, { size: 32, weight, color: k === 3 ? BRAND : "#fff", tracking: -0.03 });
    pen.text(String(weight), wx, 368, { size: 10, weight: 600, color: MUTED, mono: true });
  });

  // Type scale
  const scaleRows = [
    { sample: "Zgodba.", size: 54, weight: 800, tag: "DISPLAY · 96", color: "#fff" },
    { sample: "Naslov strani", size: 30, weight: 700, tag: "H1 · 56", color: "#fff" },
    { sample: "Podnaslov sekcije", size: 20, weight: 600, tag: "H2 · 32", color: "rgba(255,255,255,0.92)" },
    { sample: "Besedilo, ki se lepo bere.", size: 14.5, weight: 500, tag: "BESEDILO · 16", color: "#b3b3b3" },
  ];
  let sy = 104;
  for (const row of scaleRows) {
    sy += row.size + 14;
    pen.text(row.sample, 358, sy, {
      size: row.size,
      weight: row.weight,
      color: row.color,
      tracking: row.size > 24 ? -0.05 : -0.01,
    });
    pen.text(row.tag, 686, sy, { size: 10, weight: 700, color: "#808080", tracking: 0.14, mono: true, align: "right" });
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(358, sy + 12, 328, 1.5);
  }
  pen.text("VRSTIČNI RAZMIK 0.92 · SLEDENJE −0.055 EM", 358, 368, {
    size: 10,
    weight: 600,
    color: "#808080",
    tracking: 0.14,
    mono: true,
  });

  // Swatches
  const swatches = [
    { color: "#000000", name: "Črna", hex: "#000000", outlined: true },
    { color: "#F4F1EC", name: "Topli kamen", hex: "#F4F1EC", outlined: false },
    { color: "#F5751E", name: "PG oranžna", hex: "#F5751E", outlined: false },
    { color: "#141414", name: "Grafit", hex: "#141414", outlined: true },
  ];
  swatches.forEach((s, k) => {
    const cx = 768 + (k % 2) * 124;
    const cy = 148 + Math.floor(k / 2) * 136;
    const r = 34;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    if (s.outlined) {
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    pen.text(s.name, cx - r, cy + 56, { size: 14, weight: 600, color: "#fff" });
    pen.text(s.hex, cx - r, cy + 74, { size: 10.5, weight: 600, color: MUTED, tracking: 0.08, mono: true });
  });

  // Components
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(m, 408, W - m * 2, 1.5);
  label("KOMPONENTE", m, 438);

  const pill = (x: number, y: number, text: string, fill: string | null, color: string, border?: string) => {
    const style: TextStyle = { size: 13.5, weight: 700, color };
    const pw = pen.measure(text, style) + 34;
    const ph = 38;
    if (fill) {
      ctx.fillStyle = fill;
      pen.roundRect(x, y, pw, ph, ph / 2);
      ctx.fill();
    }
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.6;
      pen.roundRect(x, y, pw, ph, ph / 2);
      ctx.stroke();
    }
    pen.text(text, x + 17, y + 24, style);
    return pw;
  };

  let px = m;
  const py = 466;
  px += pill(px, py, "Začnimo projekt →", BRAND, "#000") + 14;
  px += pill(px, py, "Več o nas", null, "#fff", "rgba(255,255,255,0.4)") + 14;
  label("HOVER", px + 4, py - 8, BRAND);
  px += pill(px, py, "Pišite nam", "#fff", "#000") + 22;

  // Toggle
  ctx.fillStyle = BRAND;
  pen.roundRect(px, py + 7, 48, 24, 12);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(px + 36, py + 19, 8.5, 0, TAU);
  ctx.fill();

  // Email input
  const ix = 602;
  label("E-POŠTA", ix, py + 2);
  const email = "info@vasaznamka.si";
  const eStyle: TextStyle = { size: 15, weight: 600, color: "#fff" };
  pen.text(email, ix, py + 28, eStyle);
  ctx.fillStyle = BRAND;
  ctx.fillRect(ix, py + 38, 192, 2.2);
  ctx.fillRect(ix + pen.measure(email, eStyle) + 3, py + 14, 2.2, 17);

  // Corner radii
  [
    { label: "0", r: 0 },
    { label: "4", r: 4 },
    { label: "12", r: 9 },
    { label: "∞", r: 14 },
  ].forEach((item, k) => {
    const rx = 834 + k * 38;
    const ry = py + 4;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.6;
    pen.roundRect(rx, ry, 28, 28, item.r);
    ctx.stroke();
    pen.text(item.label, rx + 14, ry + 45, { size: 10.5, weight: 600, color: MUTED, mono: true, align: "center" });
  });

  // Spacing scale
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(m, 542, W - m * 2, 1.5);
  label("RAZMIKI", m, 580);
  let sx = m + 86;
  for (const val of [4, 8, 16, 24, 48, 96]) {
    const bw = Math.max(8, val * 0.8);
    ctx.fillStyle = BRAND;
    ctx.fillRect(sx, 568, bw, 12);
    pen.text(String(val), sx, 598, { size: 10.5, weight: 600, color: MUTED, mono: true });
    sx += Math.max(bw, 22) + 18;
  }
  label("MREŽA 12 × 24 PX", W - m, 580, "#808080", "right");
}

/**
 * Layer 04 — IZKUŠNJA / REZULTAT: Editorial dark website with minimalist architectural
 * pavilion art, distinct card thumbnails, and optional browser chrome.
 */
export function paintHighCraftSite(pen: Pen, media?: SiteMediaAssets) {
  const { ctx } = pen;
  const W = 1024;
  const H = 640;
  const m = 56;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Top-right warm ambient glow
  const glow = ctx.createRadialGradient(W * 0.78, 30, 20, W * 0.78, 30, 420);
  glow.addColorStop(0, "rgba(245,117,30,0.14)");
  glow.addColorStop(1, "rgba(245,117,30,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Navigation
  const navH = 64;
  const brandStyle: TextStyle = { size: 20, weight: 800, color: "#fff", tracking: -0.045 };
  pen.text("Vaša znamka", m, 39, brandStyle);
  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(m + pen.measure("Vaša znamka", brandStyle) + 6, 36, 4.2, 0, TAU);
  ctx.fill();

  const ctaStyle: TextStyle = { size: 13, weight: 700, color: "#000" };
  const ctaW = pen.measure("Pišite nam", ctaStyle) + 32;
  const ctaH = 32;
  const ctaX = W - m - ctaW;
  const ctaY = (navH - ctaH) / 2;
  ctx.fillStyle = "#fff";
  pen.roundRect(ctaX, ctaY, ctaW, ctaH, ctaH / 2);
  ctx.fill();
  pen.text("Pišite nam", ctaX + 16, ctaY + 20.5, ctaStyle);

  const linkStyle: TextStyle = { size: 13.5, weight: 600, color: "rgba(255,255,255,0.8)" };
  let lx = ctaX - 28;
  for (const text of ["Novice", "Studio", "Delo"]) {
    lx -= pen.measure(text, linkStyle);
    pen.text(text, lx, 37, linkStyle);
    lx -= 28;
  }
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, navH, W, 1.5);

  // Left hero column
  pen.text("VAŠA DEJAVNOST · VAŠE MESTO", m, 134, {
    size: 11,
    weight: 700,
    color: MUTED,
    tracking: 0.16,
    mono: true,
  });

  const hStyle: TextStyle = { size: 64, weight: 800, color: "#fff", tracking: -0.055 };
  ["Tu stoji", "vaša", "zgodba"].forEach((line, k) => {
    pen.text(line, m - 2, 200 + k * 59, hStyle);
  });
  pen.text(".", m - 2 + pen.measure("zgodba", hStyle), 318, { size: 64, weight: 800, color: BRAND });

  const bodyStyle: TextStyle = { size: 15, weight: 500, color: "#a6a6a6" };
  pen.text("Kratko, jasno sporočilo o tem,", m, 360, bodyStyle);
  pen.text("kaj ponujate in komu.", m, 383, bodyStyle);

  // Primary orange CTA + glow + crisp pointer
  const btnLabel = "Poglej ponudbo →";
  const btnStyle: TextStyle = { size: 14, weight: 700, color: "#000" };
  const btnW = pen.measure(btnLabel, btnStyle) + 42;
  const btnH = 44;
  const btnY = 416;

  ctx.save();
  ctx.shadowColor = "rgba(245,117,30,0.4)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = BRAND;
  pen.roundRect(m, btnY, btnW, btnH, btnH / 2);
  ctx.fill();
  ctx.restore();
  pen.text(btnLabel, m + 21, btnY + 27, btnStyle);

  const linkX = m + btnW + 26;
  const oNasStyle: TextStyle = { size: 14, weight: 600, color: "#fff" };
  pen.text("O nas", linkX, btnY + 27, oNasStyle);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(linkX, btnY + 32, pen.measure("O nas", oNasStyle), 1.5);

  paintArrowPointer(ctx, m + btnW - 22, btnY + btnH - 12);

  // Right hero architectural artwork (uses bespoke architectural photograph when loaded)
  const artX = 532;
  const artY = 114;
  const artW = W - m - artX;
  const artH = 350;
  const drewHeroPhoto = media?.hero && drawCoverImage(ctx, media.hero, artX, artY, artW, artH, 6);
  if (!drewHeroPhoto) {
    paintArchitecturalPavilion(ctx, artX, artY, artW, artH);
  }

  // Bottom vignette + caption over hero artwork
  const capGrad = ctx.createLinearGradient(0, artY + artH - 96, 0, artY + artH);
  capGrad.addColorStop(0, "rgba(0,0,0,0)");
  capGrad.addColorStop(1, "rgba(0,0,0,0.84)");
  ctx.fillStyle = capGrad;
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(artX, artY, artW, artH, 6);
  else ctx.rect(artX, artY, artW, artH);
  ctx.clip();
  ctx.fillRect(artX, artY + artH - 96, artW, 96);
  ctx.restore();

  pen.text("ARHITEKTURNI PAVILJON", artX + 18, artY + artH - 16, {
    size: 10.5,
    weight: 700,
    color: "#fff",
    tracking: 0.15,
    mono: true,
  });
  pen.text("2026", artX + artW - 18, artY + artH - 16, {
    size: 10.5,
    weight: 700,
    color: BRAND,
    tracking: 0.15,
    mono: true,
    align: "right",
  });
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.5;
  pen.roundRect(artX, artY, artW, artH, 6);
  ctx.stroke();

  // Bottom 3 cards
  const cards = [
    { name: "Vaša storitev", meta: "PONUDBA", active: true },
    { name: "Vaš izdelek", meta: "TRGOVINA", active: false },
    { name: "Vaša referenca", meta: "ZGODBE STRANK", active: false },
  ];
  const cardGap = 22;
  const cardW = (W - m * 2 - cardGap * 2) / 3;
  const cardY = 516;
  for (let k = 0; k < 3; k++) {
    const cxCard = m + k * (cardW + cardGap);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(cxCard, cardY, cardW, 1.5);

    const cardImg = media?.cards?.[k];
    const drewCardPhoto = cardImg && drawCoverImage(ctx, cardImg, cxCard, cardY + 16, 92, 66, 4);
    if (!drewCardPhoto) {
      paintCardThumb(ctx, cxCard, cardY + 16, 92, 66, k);
    } else {
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1.25;
      pen.roundRect(cxCard, cardY + 16, 92, 66, 4);
      ctx.stroke();
    }
    pen.text(cards[k].name, cxCard + 108, cardY + 42, { size: 15, weight: 700, color: "#fff", tracking: -0.02 });
    pen.text(cards[k].meta, cxCard + 108, cardY + 62, {
      size: 10,
      weight: 700,
      color: MUTED,
      tracking: 0.12,
      mono: true,
    });
    pen.text("→", cxCard + cardW - 16, cardY + 46, {
      size: 16,
      weight: 700,
      color: cards[k].active ? BRAND : "#6d6d6d",
    });
  }
}

/** Paints the browser bar strip (`vasaznamka.si`) cleanly for the merged Rezultat reveal. */
export function paintBrowserChrome(pen: Pen, w: number, h: number) {
  const { ctx } = pen;
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(0, h - 1.5, w, 1.5);

  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.arc(24 + k * 14, h / 2, 3.6, 0, TAU);
    ctx.fill();
  }

  const pillW = 160;
  const pillH = 20;
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  pen.roundRect(w / 2 - pillW / 2, (h - pillH) / 2, pillW, pillH, 4);
  ctx.fill();

  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(w / 2 - 52, h / 2, 3, 0, TAU);
  ctx.fill();
  pen.text("vasaznamka.si", w / 2 + 6, h / 2 + 4, {
    size: 11.5,
    weight: 600,
    color: "rgba(255,255,255,0.72)",
    tracking: 0.04,
    mono: true,
    align: "center",
  });
}

function paintArrowPointer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 20);
  ctx.lineTo(x + 5.2, y + 14.8);
  ctx.lineTo(x + 9.2, y + 22.2);
  ctx.lineTo(x + 12, y + 20.6);
  ctx.lineTo(x + 8.2, y + 13.6);
  ctx.lineTo(x + 15.2, y + 13.6);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

function paintArchitecturalPavilion(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(w / 500, h / 402);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, 402);
  sky.addColorStop(0, "#090909");
  sky.addColorStop(0.55, "#18110c");
  sky.addColorStop(1, "#381a08");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 500, 402);

  // Sun glow
  const sunGlow = ctx.createRadialGradient(340, 185, 10, 340, 185, 240);
  sunGlow.addColorStop(0, "rgba(255,178,117,0.48)");
  sunGlow.addColorStop(0.35, "rgba(245,117,30,0.22)");
  sunGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 500, 402);

  // Elevation grid
  ctx.strokeStyle = "rgba(255,255,255,0.065)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const gx of [60, 170, 280, 390]) {
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, 296);
  }
  for (const gy of [90, 195]) {
    ctx.moveTo(0, gy);
    ctx.lineTo(500, gy);
  }
  ctx.stroke();

  // Diagonal beam
  const beam = ctx.createLinearGradient(325, 0, 200, 296);
  beam.addColorStop(0, "rgba(245,117,30,0.24)");
  beam.addColorStop(1, "rgba(245,117,30,0)");
  ctx.fillStyle = beam;
  poly(ctx, [[325, 0], [445, 0], [245, 296], [155, 296]]);
  ctx.fill();

  // Solar disc
  ctx.fillStyle = "rgba(245,117,30,0.18)";
  ctx.beginPath();
  ctx.arc(348, 176, 64, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(245,117,30,0.94)";
  ctx.beginPath();
  ctx.arc(348, 176, 44, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,178,117,0.58)";
  ctx.beginPath();
  ctx.arc(340, 166, 24, 0, TAU);
  ctx.fill();

  // Background tower
  ctx.fillStyle = "#121212";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.6;
  poly(ctx, [[246, 112], [318, 128], [318, 296], [246, 296]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a1310";
  ctx.strokeStyle = "rgba(245,117,30,0.36)";
  poly(ctx, [[318, 128], [362, 146], [362, 296], [318, 296]]);
  ctx.fill();
  ctx.stroke();

  // Foreground architectural pavilion
  const frontGrad = ctx.createLinearGradient(0, 134, 0, 296);
  frontGrad.addColorStop(0, "#1f1f1f");
  frontGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = frontGrad;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.8;
  poly(ctx, [[74, 158], [262, 134], [262, 296], [74, 296]]);
  ctx.fill();
  ctx.stroke();

  const litGrad = ctx.createLinearGradient(262, 134, 328, 296);
  litGrad.addColorStop(0, "#332014");
  litGrad.addColorStop(1, "#0e0c0b");
  ctx.fillStyle = litGrad;
  ctx.strokeStyle = "rgba(245,117,30,0.55)";
  poly(ctx, [[262, 134], [328, 158], [328, 296], [262, 296]]);
  ctx.fill();
  ctx.stroke();

  // Cantilevered roof slab
  ctx.fillStyle = "#262626";
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  poly(ctx, [[56, 154], [264, 126], [344, 154], [262, 138]]);
  ctx.fill();
  ctx.stroke();

  // Corner ridge highlight
  ctx.strokeStyle = "rgba(245,117,30,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(262, 134);
  ctx.lineTo(262, 296);
  ctx.stroke();

  // Warm lit glazing
  const glass = ctx.createLinearGradient(0, 158, 0, 206);
  glass.addColorStop(0, "rgba(255,178,117,0.92)");
  glass.addColorStop(1, "rgba(245,117,30,0.36)");
  ctx.fillStyle = glass;
  poly(ctx, [[94, 174], [242, 158], [242, 194], [94, 206]]);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1.5;
  poly(ctx, [[94, 222], [184, 216], [184, 250], [94, 254]]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(245,117,30,0.32)";
  ctx.strokeStyle = "rgba(245,117,30,0.62)";
  poly(ctx, [[196, 215], [242, 212], [242, 248], [196, 250]]);
  ctx.fill();
  ctx.stroke();

  // Mullions
  ctx.strokeStyle = "#0b0b0b";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(142, 168);
  ctx.lineTo(142, 202);
  ctx.moveTo(194, 163);
  ctx.lineTo(194, 198);
  ctx.stroke();

  // Ground reflection plane
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 296, 500, 106);
  ctx.fillStyle = "rgba(245,117,30,0.68)";
  ctx.fillRect(0, 295, 500, 2.2);
  ctx.fillStyle = "rgba(245,117,30,0.26)";
  ctx.fillRect(94, 308, 148, 2.5);
  ctx.fillStyle = "rgba(245,117,30,0.16)";
  ctx.fillRect(116, 324, 104, 2);
  ctx.fillStyle = "rgba(255,178,117,0.3)";
  ctx.fillRect(304, 314, 88, 2.5);
  ctx.fillStyle = "rgba(245,117,30,0.16)";
  ctx.fillRect(320, 330, 56, 2);

  // Top-right accent dot
  ctx.fillStyle = BRAND;
  ctx.beginPath();
  ctx.arc(474, 26, 4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function paintCardThumb(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, variant: number) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 4);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(w / 104, h / 74);

  if (variant === 0) {
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0, 0, 104, 74);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const gx of [26, 52, 78]) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, 74);
    }
    ctx.stroke();
    ctx.fillStyle = "#161616";
    ctx.strokeStyle = "rgba(255,255,255,0.36)";
    ctx.fillRect(20, 18, 42, 36);
    ctx.strokeRect(20, 18, 42, 36);
    ctx.fillStyle = "#22150d";
    ctx.strokeStyle = "rgba(245,117,30,0.85)";
    ctx.fillRect(62, 26, 22, 28);
    ctx.strokeRect(62, 26, 22, 28);
    ctx.fillStyle = "rgba(245,117,30,0.9)";
    ctx.fillRect(28, 26, 26, 9);
    ctx.fillStyle = "rgba(245,117,30,0.6)";
    ctx.fillRect(0, 53.5, 104, 1.8);
  } else if (variant === 1) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 104, 74);
    const g = ctx.createRadialGradient(52, 34, 2, 52, 34, 48);
    g.addColorStop(0, "rgba(245,117,30,0.36)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 104, 74);
    ctx.fillStyle = "#141414";
    ctx.strokeStyle = "rgba(255,255,255,0.24)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(52, 56, 28, 6, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#151515";
    ctx.strokeStyle = "rgba(255,255,255,0.42)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(38, 16, 28, 38, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(38, 16, 28, 38);
      ctx.strokeRect(38, 16, 28, 38);
    }
    ctx.fillStyle = "rgba(245,117,30,0.92)";
    ctx.fillRect(43, 22, 18, 12);
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.fillRect(43, 40, 18, 2);
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.fillRect(43, 45, 12, 2);
  } else {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 104, 74);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const bx of [6, 32, 72, 98]) {
      ctx.moveTo(52, 34);
      ctx.lineTo(bx, 74);
    }
    ctx.moveTo(0, 46);
    ctx.lineTo(104, 46);
    ctx.moveTo(0, 58);
    ctx.lineTo(104, 58);
    ctx.stroke();
    ctx.fillStyle = "rgba(245,117,30,0.24)";
    ctx.beginPath();
    ctx.arc(52, 34, 14, 0, TAU);
    ctx.fill();
    ctx.fillStyle = BRAND;
    ctx.beginPath();
    ctx.arc(52, 34, 7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(245,117,30,0.68)";
    ctx.fillRect(0, 33.2, 104, 1.8);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 4);
  else ctx.rect(x, y, w, h);
  ctx.stroke();
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
}
