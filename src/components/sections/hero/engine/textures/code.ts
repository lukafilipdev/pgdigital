import { BRAND, type Pen } from "../pen";

const CODE_LINES = [
  "import { Hero, Mreza, Gumb } from './komponente';",
  "import { useLenis, useScroll } from './gibanje';",
  "",
  "export default function Domov({ projekti }) {",
  "  const ref = useRef(null);",
  "  const p = useScroll(ref, { pin: true, scrub: 0.8 });",
  "  useLenis({ lerp: 0.08 });",
  "",
  "  return (",
  '    <main ref={ref} className="stran">',
  "      <Mreza stolpci={12} razmik={24} />",
  "      <Hero",
  '        naslov="Tu stoji vaša zgodba."',
  "        slika={projekti[0].naslovna}",
  "        premik={p * 0.4}",
  "      />",
  "      {projekti.map((pr) => (",
  "        <Kartica key={pr.id} {...pr} />",
  "      ))}",
  '      <Gumb barva="#F5751E">Poglej projekte</Gumb>',
  "    </main>",
  "  );",
  "}",
  "",
  "// build 1,2 s · 0 napak · Lighthouse 98",
  "",
];

const KEYWORDS = "import|from|export|default|function|const|return|true|key";
const TOKEN = new RegExp(
  `("[^"]*"|'[^']*'|\\/\\/.*$|\\b(?:${KEYWORDS})\\b|<\\/?[A-Za-z]+|[{}()=>;.,\\/]|\\d+(?:\\.\\d+)?)`,
);
const KEYWORD = new RegExp(`^(?:${KEYWORDS})$`);
const PUNCTUATION = /^[{}()=>;.,/]$/;

function tokenColor(token: string, tone: "dark" | "light") {
  if (tone === "light") {
    if (token.startsWith("//")) return "rgba(185,73,12,.72)";
    if (token[0] === '"' || token[0] === "'") return "rgba(10,10,10,.82)";
    if (KEYWORD.test(token)) return "#c8520d";
    if (token[0] === "<") return "#0a0a0a";
    if (PUNCTUATION.test(token)) return "rgba(10,10,10,.3)";
    if (/^\d/.test(token)) return "#b9490c";
    return "rgba(10,10,10,.52)";
  }
  if (token.startsWith("//")) return "rgba(245,117,30,.8)";
  if (token[0] === '"' || token[0] === "'") return "rgba(255,255,255,.95)";
  if (KEYWORD.test(token)) return BRAND;
  if (token[0] === "<") return "#fff";
  if (PUNCTUATION.test(token)) return "rgba(255,255,255,.3)";
  if (/^\d/.test(token)) return "#ffb275";
  return "rgba(255,255,255,.55)";
}

/** Repeating source columns cover the viewport, including both outer edges. */
export function paintCode(pen: Pen, w: number, h: number, tone: "dark" | "light" = "dark") {
  const { ctx } = pen;
  ctx.fillStyle = tone === "light" ? "#ece8e0" : "#050505";
  ctx.fillRect(0, 0, w, h);

  const fontSize = Math.max(11, Math.min(w, h) * 0.018);
  const lineHeight = fontSize * 1.8;
  const columnWidth = fontSize * 38;
  ctx.font = `500 ${fontSize}px ${pen.fonts.mono}`;

  for (let column = 0, left = -fontSize * 5; left < w; column++, left += columnWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - fontSize * 3, 0, columnWidth, h);
    ctx.clip();
    let line = 0;
    for (let y = fontSize * 2; y < h + lineHeight; y += lineHeight, line++) {
      ctx.textAlign = "right";
      ctx.fillStyle = tone === "light" ? "rgba(11,11,12,.22)" : "rgba(255,255,255,.18)";
      ctx.fillText(String(line + 1), left - fontSize * 1.6, y);
      ctx.textAlign = "left";

      let x = left;
      for (const token of CODE_LINES[(line + column * 7) % CODE_LINES.length].split(TOKEN)) {
        if (!token) continue;
        ctx.fillStyle = tokenColor(token, tone);
        ctx.fillText(token, x, y);
        x += ctx.measureText(token).width;
      }
    }
    ctx.restore();
  }

  // Highlight the "current" line.
  ctx.fillStyle = tone === "light" ? "rgba(245,117,30,.08)" : "rgba(245,117,30,.07)";
  ctx.fillRect(0, fontSize * 2 + lineHeight * 12 - fontSize * 1.2, w, lineHeight);
}
