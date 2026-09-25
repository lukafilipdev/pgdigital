import { BRAND, type Pen, type Rect, type TextStyle } from "../pen";
import { paintSite } from "./site";

/** Design width the redline measurements are reported in. */
const REFERENCE_WIDTH = 1440;

/**
 * The "structure" layer: the landing page dimmed, overlaid with a 12-column
 * grid, element outlines, tags and redline measurements — like a design tool.
 */
export function paintInspect(pen: Pen, w: number, h: number) {
  const { ctx } = pen;
  const site = paintSite(pen, w, h, false);
  const { unit: u, margin: m } = site;
  const tf = u * 1.05;
  const scale = REFERENCE_WIDTH / w;
  const tagText: TextStyle = { size: tf, weight: 600, color: "#000", tracking: 0.1, mono: true };
  const numberText: TextStyle = { size: tf, weight: 600, color: "#000", mono: true };

  ctx.fillStyle = "rgba(11,11,11,.74)";
  ctx.fillRect(0, 0, w, h);

  const columnW = (w - 2 * m) / 12;
  const gutter = u * 1.8;
  ctx.fillStyle = "rgba(245,117,30,.05)";
  for (let i = 0; i < 12; i++) ctx.fillRect(m + i * columnW + gutter / 2, 0, columnW - gutter, h);

  const tag = (label: string, x: number, y: number, selected: boolean) => {
    const tagW = pen.measure(label, tagText) + tf * 1.4;
    const tagH = tf * 2;
    ctx.fillStyle = selected ? BRAND : "rgba(255,255,255,.92)";
    pen.roundRect(x, y - tagH, tagW, tagH, 2);
    ctx.fill();
    pen.text(label, x + tf * 0.7, y - tagH * 0.3, tagText);
  };

  const outline = ([x, y, bw, bh]: Rect, label = "", selected = false) => {
    ctx.strokeStyle = selected ? BRAND : "rgba(255,255,255,.42)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, bw, bh);
    if (label) tag(label, x, y - u * 0.4, selected);
  };

  /** Diagonal hatching around a rect, showing its padding. */
  const padding = ([x, y, bw, bh]: Rect, pad: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - pad, y - pad, bw + pad * 2, bh + pad * 2);
    ctx.rect(x, y, bw, bh);
    ctx.clip("evenodd");
    ctx.strokeStyle = "rgba(245,117,30,.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = -bh - pad * 2; k < bw + pad * 2; k += u * 0.7) {
      ctx.moveTo(x - pad + k, y + bh + pad);
      ctx.lineTo(x - pad + k + bh + pad * 2, y - pad);
    }
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "rgba(245,117,30,.6)";
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x - pad + 0.5, y - pad + 0.5, bw + pad * 2, bh + pad * 2);
    ctx.setLineDash([]);
  };

  /** Horizontal or vertical redline with end caps and a px label. */
  const measure = (x0: number, y0: number, x1: number, y1: number) => {
    const vertical = x0 === x1;
    const cap = u * 0.6;
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    if (vertical) {
      ctx.moveTo(x0 - cap, y0);
      ctx.lineTo(x0 + cap, y0);
      ctx.moveTo(x0 - cap, y1);
      ctx.lineTo(x0 + cap, y1);
    } else {
      ctx.moveTo(x0, y0 - cap);
      ctx.lineTo(x0, y0 + cap);
      ctx.moveTo(x1, y0 - cap);
      ctx.lineTo(x1, y0 + cap);
    }
    ctx.stroke();

    const distance = Math.round(((vertical ? y1 - y0 : x1 - x0) * scale) / 4) * 4;
    const label = String(distance);
    const labelW = pen.measure(label, numberText) + tf;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    ctx.fillStyle = BRAND;
    pen.roundRect(cx - labelW / 2, cy - tf * 0.9, labelW, tf * 1.8, 2);
    ctx.fill();
    pen.text(label, cx, cy + tf * 0.38, { ...numberText, align: "center" });
  };

  outline(site.nav, "NAVIGACIJA · STICKY");
  outline(site.paragraph, "BESEDILO");
  padding(site.button, u * 1.1);
  outline(site.button);
  outline(site.image, "SLIKA · 16:10 · LAZY");
  site.cards.forEach((card, k) => outline(card, k ? "" : `KARTICA × ${site.cards.length}`));

  // Selected headline with resize handles and its dimensions.
  const title = site.title;
  outline(title, "NASLOV · GEIST 800", true);
  const handle = u * 0.9;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 1.5;
  for (const [a, b] of [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]]) {
    const hx = title[0] + title[2] * a - handle / 2;
    const hy = title[1] + title[3] * b - handle / 2;
    ctx.fillRect(hx, hy, handle, handle);
    ctx.strokeRect(hx, hy, handle, handle);
  }
  const size = `${Math.round(title[2] * scale)} × ${Math.round(title[3] * scale)}`;
  const sizeW = pen.measure(size, numberText) + tf * 1.4;
  const sizeY = title[1] + title[3] + u * 1.2;
  ctx.fillStyle = BRAND;
  pen.roundRect(title[0] + title[2] / 2 - sizeW / 2, sizeY, sizeW, tf * 2, 2);
  ctx.fill();
  pen.text(size, title[0] + title[2] / 2, sizeY + tf * 1.38, { ...numberText, align: "center" });

  const { nav, button, image, paragraph } = site;
  if (w > h) {
    const titleRight = title[0] + title[2] + u * 3;
    measure(titleRight, nav[1] + nav[3], titleRight, title[1]);
    const buttonMidY = button[1] + button[3] / 2;
    measure(button[0] + button[2] + u * 16, buttonMidY, image[0], buttonMidY);
  }
  const paragraphRight = paragraph[0] + paragraph[2] + u * 2;
  measure(paragraphRight, paragraph[1] + paragraph[3], paragraphRight, button[1]);
}
