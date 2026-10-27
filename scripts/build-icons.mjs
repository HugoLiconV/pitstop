// Builds every app icon and iOS splash screen from the Pitstop mark: a brush trace of the Mazda 6's face.
// Run with `pnpm icons` after changing the mark; the outputs are committed.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/dist/compiled/@vercel/og/index.node.js");
const React = require("react");

const INK = "#1d1c1a", CARD = "#f6f5f2", GROUND = "#e7e5e0", ACCENT = "#e8622a";
const BOX = { x: 0, y: -40, size: 960 };

// Lines traced over public/mazda6-manual.png (source pixels). Weight scales the brush.
const WHEEL = { cx: 769, cy: 612 };
const LINES = [
  [["C", [74, 410], [150, 362], [262, 322], [410, 300]], ["C", [410, 300], [452, 295], [494, 292], [540, 292]], 1], // hood
  [["C", [488, 300], [560, 236], [640, 186], [726, 156]], ["C", [726, 156], [786, 136], [846, 124], [915, 120]], 1], // A-pillar → roof
  [["C", [96, 401], [180, 401], [300, 410], [434, 432]], 0.8], // hood brow over the grille
  [["C", [560, 298], [670, 300], [780, 302], [905, 306]], 0.6], // windshield base
  [["C", [64, 430], [56, 460], [54, 490], [55, 520]], ["C", [55, 520], [52, 570], [49, 615], [52, 642]], ["C", [52, 642], [58, 656], [78, 661], [112, 663]], ["C", [112, 663], [262, 674], [452, 682], [610, 683]], 1], // face → bumper lip
  [["C", [100, 579], [200, 582], [290, 586], [357, 594]], 0.55], // lower intake
  [["A", 158, 178, 300], 0.85], // wheel arch
  [["A", 122, -60, 240], 0.95], // tire, open under the arch
  [["A", 56, 100, 175], 0.6], // hub highlight
  [["C", [672, 410], [750, 385], [830, 362], [915, 352]], 0.5], // fender crease
];
// Closed shapes keep an even, round-joined stroke so their corners stay smooth.
const SHAPES = [
  "M80 449C140 446 250 447 340 456C320 488 300 512 280 538L178 558L104 526C90 505 82 480 80 449Z", // grille
  "M386 461C470 441 580 419 660 410C640 440 612 458 588 467C530 480 470 488 426 491C406 486 392 476 386 461Z", // headlight
];
const BADGE = { cx: 190, cy: 492 };

function sample([kind, ...args]) {
  const points = [];
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    if (kind === "C") {
      const [p0, p1, p2, p3] = args, u = 1 - t;
      points.push([0, 1].map(k => u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k]));
    } else {
      const [r, from, to] = args, a = ((from + (to - from) * t) * Math.PI) / 180;
      points.push([WHEEL.cx + r * Math.cos(a), WHEEL.cy + r * Math.sin(a)]);
    }
  }
  return points;
}

/** Outline one line as a brush stroke: swells to `width`, tapers to round tips, edges smoothed with quadratics. */
function brush(segments, width) {
  const raw = segments.flatMap((segment, i) => sample(segment).slice(i ? 1 : 0));
  const lengths = [0];
  for (let i = 1; i < raw.length; i++) lengths.push(lengths[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = lengths.at(-1), steps = Math.max(40, Math.round(total / 6));
  const at = s => {
    let i = lengths.findIndex(l => l >= s);
    if (i <= 0) i = 1;
    const k = (s - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1);
    return [raw[i - 1][0] + (raw[i][0] - raw[i - 1][0]) * k, raw[i - 1][1] + (raw[i][1] - raw[i - 1][1]) * k];
  };
  const left = [], right = [];
  let tip = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, s = t * total;
    const [x, y] = at(s), [ax, ay] = at(Math.min(total, s + 0.5)), [bx, by] = at(Math.max(0, s - 0.5));
    const angle = Math.atan2(ay - by, ax - bx);
    const w = (width / 2) * (0.22 + 0.78 * Math.sin(Math.PI * t) ** 0.6);
    if (i === 0) tip = w;
    left.push([x + Math.sin(angle) * w, y - Math.cos(angle) * w]);
    right.push([x - Math.sin(angle) * w, y + Math.cos(angle) * w]);
  }
  const f = n => n.toFixed(1);
  const smooth = pts => pts.slice(1, -1).map(([x, y], i) => `Q${f(x)} ${f(y)} ${f((x + pts[i + 2][0]) / 2)} ${f((y + pts[i + 2][1]) / 2)}`).join("") + `L${f(pts.at(-1)[0])} ${f(pts.at(-1)[1])}`;
  const back = [...right].reverse(), cap = `A${f(tip)} ${f(tip)} 0 0 1`;
  return `M${f(left[0][0])} ${f(left[0][1])}${smooth(left)}${cap} ${f(back[0][0])} ${f(back[0][1])}${smooth(back)}${cap} ${f(left[0][0])} ${f(left[0][1])}Z`;
}

/** The mark as SVG. `small` thickens the brush so it survives 32px and below. `inset` shrinks it inside its square. */
function markSvg({ small = false, tile = CARD, inset = 0 } = {}) {
  const weight = small ? 56 : 44;
  const pad = BOX.size * inset, view = `${BOX.x - pad} ${BOX.y - pad} ${BOX.size + pad * 2} ${BOX.size + pad * 2}`;
  const strokes = LINES.map(line => `<path d="${brush(line.slice(0, -1), weight * line.at(-1))}"/>`).join("");
  const shapes = SHAPES.map(d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${(weight * 0.62).toFixed(1)}" stroke-linejoin="round"/>`).join("");
  const background = tile ? `<rect x="${BOX.x - pad}" y="${BOX.y - pad}" width="${BOX.size + pad * 2}" height="${BOX.size + pad * 2}" fill="${tile}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}">${background}<g fill="${INK}">${strokes}</g>${shapes}<circle cx="${BADGE.cx}" cy="${BADGE.cy}" r="${small ? 30 : 22}" fill="${ACCENT}"/></svg>`;
}

const dataUri = svg => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const h = React.createElement;

async function png(element, width, height = width) {
  return Buffer.from(await new ImageResponse(element, { width, height }).arrayBuffer());
}
const squareIcon = (svg, size) => png(h("img", { src: dataUri(svg), width: size, height: size }), size);

/** Splash: the mark as a rounded tile on the app's warm ground, with the name underneath. No shadow: the renderer bands it. */
function splash({ width, height }) {
  const tile = Math.round(width * 0.3);
  return png(
    h("div", { style: { width, height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: GROUND } },
      h("img", { src: dataUri(markSvg()), width: tile, height: tile, style: { borderRadius: tile * 0.27 } }),
      h("div", { style: { marginTop: tile * 0.22, fontSize: tile * 0.2, letterSpacing: -tile * 0.008, color: INK } }, "pitstop"),
    ),
    width, height,
  );
}

/** A minimal .ico that wraps PNG frames (supported by every current browser). */
function ico(frames) {
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry); header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...frames.map(frame => frame.data)]);
}

mkdirSync("public/brand", { recursive: true });
mkdirSync("public/icons", { recursive: true });
mkdirSync("public/splash", { recursive: true });

writeFileSync("public/brand/mark.svg", markSvg());
writeFileSync("app/icon.svg", markSvg({ small: true }));
writeFileSync("app/apple-icon.png", await squareIcon(markSvg(), 180));
writeFileSync("app/favicon.ico", ico([
  { size: 16, data: await squareIcon(markSvg({ small: true }), 16) },
  { size: 32, data: await squareIcon(markSvg({ small: true }), 32) },
  { size: 48, data: await squareIcon(markSvg({ small: true }), 48) },
]));
writeFileSync("public/icons/icon-192.png", await squareIcon(markSvg(), 192));
writeFileSync("public/icons/icon-512.png", await squareIcon(markSvg(), 512));
// Maskable: Android may crop to a circle, so the car sits inside the central 80% safe zone.
writeFileSync("public/icons/maskable-512.png", await squareIcon(markSvg({ inset: 0.14 }), 512));

const screens = JSON.parse(readFileSync("lib/brand/splash-screens.json", "utf8"));
for (const screen of screens) writeFileSync(`public/splash/apple-splash-${screen.width}x${screen.height}.png`, await splash(screen));

console.log(`Icons and ${screens.length} splash screens written.`);
