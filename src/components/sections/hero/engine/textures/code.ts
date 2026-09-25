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

function tokenColor(token: string) {
  if (token.startsWith("//")) return "rgba(245,117,30,.8)";
  if (token[0] === '"' || token[0] === "'") return "rgba(255,255,255,.95)";
  if (KEYWORD.test(token)) return BRAND;
  if (token[0] === "<") return "#fff";
  if (PUNCTUATION.test(token)) return "rgba(255,255,255,.3)";
  if (/^\d/.test(token)) return "#ffb275";
  return "rgba(255,255,255,.55)";
}

/** Syntax-highlighted source code filling the whole texture (seen through the inner lens). */
export function paintCode(pen: Pen, w: number, h: number) {
  const { ctx } = pen;
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  const fontSize = Math.max(11, Math.min(w, h) * 0.02);
  const lineHeight = fontSize * 1.8;
  const left = Math.max(w * 0.08, w / 2 - fontSize * 17);
  ctx.font = `500 ${fontSize}px ${pen.fonts.mono}`;

  let line = 0;
  for (let y = fontSize * 2; y < h + lineHeight; y += lineHeight, line++) {
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillText(String(line + 1), left - fontSize * 1.6, y);
    ctx.textAlign = "left";

    let x = left;
    for (const token of CODE_LINES[line % CODE_LINES.length].split(TOKEN)) {
      if (!token) continue;
      ctx.fillStyle = tokenColor(token);
      ctx.fillText(token, x, y);
      x += ctx.measureText(token).width;
    }
  }

  // Highlight the "current" line.
  ctx.fillStyle = "rgba(245,117,30,.07)";
  ctx.fillRect(0, fontSize * 2 + lineHeight * 12 - fontSize * 1.2, w, lineHeight);
}
