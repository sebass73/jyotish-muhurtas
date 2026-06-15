import { PLANET_COLORS, PLANET_ICONS, activeMuhurtaIndex } from "../utils/constants.js";
import { T } from "../utils/i18n.js";

const NS = "http://www.w3.org/2000/svg";

const EDGE_LABELS = {
  es: { salida: "Salida", puesta: "Puesta" },
  en: { salida: "Sunrise", puesta: "Sunset" },
  it: { salida: "Alba",    puesta: "Tramonto" },
};

function svgEl(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function pt(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
}

function toMin(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function durMin(inicio, fin) {
  const s = toMin(inicio);
  const e = toMin(fin);
  return e >= s ? e - s : e + 1440 - s;
}

function sectorCCW(cx, cy, rIn, rOut, startDeg, endDeg) {
  const [ox1, oy1] = pt(cx, cy, rOut, startDeg);
  const [ox2, oy2] = pt(cx, cy, rOut, endDeg);
  const [ix1, iy1] = pt(cx, cy, rIn, endDeg);
  const [ix2, iy2] = pt(cx, cy, rIn, startDeg);
  const lg = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
  return `M${ox1} ${oy1} A${rOut} ${rOut} 0 ${lg} 0 ${ox2} ${oy2} L${ix1} ${iy1} A${rIn} ${rIn} 0 ${lg} 1 ${ix2} ${iy2} Z`;
}

function sectorCW(cx, cy, rIn, rOut, startDeg, endDeg) {
  const [ox1, oy1] = pt(cx, cy, rOut, startDeg);
  const [ox2, oy2] = pt(cx, cy, rOut, endDeg);
  const [ix1, iy1] = pt(cx, cy, rIn, endDeg);
  const [ix2, iy2] = pt(cx, cy, rIn, startDeg);
  const lg = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
  return `M${ox1} ${oy1} A${rOut} ${rOut} 0 ${lg} 1 ${ox2} ${oy2} L${ix1} ${iy1} A${rIn} ${rIn} 0 ${lg} 0 ${ix2} ${iy2} Z`;
}

// ── Tooltip singleton ────────────────────────────────────────────────────────
let _tooltip = null;
function getTooltip() {
  if (!_tooltip) {
    _tooltip = document.createElement("div");
    _tooltip.className = "chart-tooltip";
    document.body.appendChild(_tooltip);
  }
  return _tooltip;
}

// totalAll = suma total de minutos del día (día + noche), escala 360°
function drawSectors(svg, cx, cy, rIn, rOut, rNum, muhurtas, totalAll, startDeg, isNight, activeIdx, textColor, planetNames) {
  let curDeg = startDeg;
  const midAngles = [];

  for (let i = 0; i < muhurtas.length; i++) {
    const m = muhurtas[i];
    const angle  = (durMin(m.inicio, m.fin) / totalAll) * 360;
    const endDeg = curDeg - angle;
    const midDeg = curDeg - angle / 2;
    midAngles.push(midDeg);

    const planetKey  = m.planeta.toLowerCase();
    const color      = PLANET_COLORS[planetKey] ?? "#ccc";
    const icon       = PLANET_ICONS[planetKey] ?? "?";
    const isCur      = i === activeIdx;
    const g          = svgEl("g");
    g.style.cursor   = "pointer";

    g.appendChild(svgEl("path", {
      d: isNight
        ? sectorCW(cx, cy, rIn, rOut, curDeg, endDeg)
        : sectorCCW(cx, cy, rIn, rOut, curDeg, endDeg),
      fill: color,
      stroke: "#fff",
      "stroke-width": isCur ? "3" : "1.5",
      opacity: isNight ? "0.82" : "1",
    }));

    // Tooltip
    const label = `${planetNames[m.planeta] ?? m.planeta}  ${m.inicio} → ${m.fin}`;
    const tt = getTooltip();
    g.addEventListener("mouseenter", () => {
      tt.textContent = label;
      tt.classList.add("visible");
    });
    g.addEventListener("mousemove", (e) => {
      tt.style.left = (e.clientX + 14) + "px";
      tt.style.top  = (e.clientY - 36) + "px";
    });
    g.addEventListener("mouseleave", () => {
      tt.classList.remove("visible");
    });

    // Símbolo del planeta (sin rotación, centrado en el sector)
    const [dx, dy] = pt(cx, cy, (rIn + rOut) / 2, midDeg);
    g.appendChild(svgEl("text", {
      x: dx, y: dy,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "15",
      fill: "#fff",
      "font-weight": "bold",
      "pointer-events": "none",
    }, icon));

    // Número exterior
    const [nx, ny] = pt(cx, cy, rNum, midDeg);
    g.appendChild(svgEl("text", {
      x: nx, y: ny,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "11",
      fill: isCur ? "#ff6600" : textColor,
      "font-weight": isCur ? "bold" : "normal",
    }, String(i + 1)));

    svg.appendChild(g);
    curDeg = endDeg;
  }

  return midAngles;
}

function buildLegend(muhurtasDia, muhurtasNoche, planetNames, isDark) {
  const legend = document.createElement("div");
  legend.className = "chart-legend";

  // Planetas únicos en orden de aparición
  const seen = new Set();
  const planets = [];
  for (const m of [...muhurtasDia, ...(muhurtasNoche ?? [])]) {
    const key = m.planeta.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      planets.push(key);
    }
  }

  for (const key of planets) {
    const color = PLANET_COLORS[key] ?? "#ccc";
    const icon  = PLANET_ICONS[key] ?? "?";
    const name  = planetNames[key] ?? key;

    const item = document.createElement("div");
    item.className = "chart-legend-item";

    const iconEl = document.createElement("span");
    iconEl.className = "chart-legend-icon";
    iconEl.textContent = icon;
    iconEl.style.color = color;

    const nameEl = document.createElement("span");
    nameEl.className = "chart-legend-name";
    nameEl.textContent = name;

    item.appendChild(iconEl);
    item.appendChild(nameEl);
    legend.appendChild(item);
  }

  return legend;
}

export default class ChartDisplay {
  constructor(selector) {
    this.container = document.querySelector(selector);
    this.svg = null;
  }

  showLoading() {}
  hideLoading() {}

  update(muhurtasDia, muhurtasNoche) {
    if (!muhurtasDia?.length) return;

    const lang        = localStorage.getItem("lang") || "es";
    const planetNames = T[lang]?.planets ?? {};
    const isDark      = document.documentElement.classList.contains("dark");
    const textColor   = isDark ? "#e0e0e0" : "#333";
    const ll          = EDGE_LABELS[lang] ?? EDGE_LABELS.es;

    const W = 620, H = 620;
    const CX = W / 2, CY = H / 2;
    const R_IN = 100, R_OUT = 200, R_NUM = 228;
    // Crop 50px de cada lado: el contenido real empieza en ~60px desde el borde
    const CROP = 50;

    const dayTotal   = muhurtasDia.reduce((s, m) => s + durMin(m.inicio, m.fin), 0);
    const nightTotal = muhurtasNoche?.reduce((s, m) => s + durMin(m.inicio, m.fin), 0) ?? 0;
    const totalAll   = dayTotal + nightTotal;

    // Día centrado en la cima (90°), noche en la base (270°)
    // Ambos extremos se desplazan simétricamente según el largo del día
    const dayDeg      = (dayTotal / totalAll) * 360;
    const salidaAngle = 90 + dayDeg / 2;   // siempre en cuadrante izquierdo
    const puestaAngle = 90 - dayDeg / 2;   // siempre en cuadrante derecho

    const dayIdx   = activeMuhurtaIndex(muhurtasDia);
    const nightIdx = muhurtasNoche?.length ? activeMuhurtaIndex(muhurtasNoche) : -1;

    const svg = svgEl("svg", {
      viewBox: `${CROP} ${CROP} ${W - CROP * 2} ${H - CROP * 2}`,
      width: "100%",
      style: "display:block;overflow:visible",
    });

    // Día: salidaAngle → puestaAngle, antihorario (centrado arriba)
    const dayMids = drawSectors(
      svg, CX, CY, R_IN, R_OUT, R_NUM,
      muhurtasDia, totalAll, salidaAngle, false, dayIdx, textColor, planetNames
    );

    // Noche: puestaAngle → salidaAngle, horario (centrado abajo), cierra el círculo
    let nightMids = [];
    if (muhurtasNoche?.length && nightTotal > 0) {
      nightMids = drawSectors(
        svg, CX, CY, R_IN, R_OUT, R_NUM,
        muhurtasNoche, totalAll, puestaAngle, true, nightIdx, textColor, planetNames
      );
    }

    // ── Etiquetas Salida / Puesta ─────────────────────────────────────────
    function edgeLabel(angleDeg, label) {
      const cosA = Math.cos((angleDeg * Math.PI) / 180);
      const [lx, ly] = pt(CX, CY, R_OUT + 6, angleDeg);
      const anchor = cosA < -0.2 ? "end" : cosA > 0.2 ? "start" : "middle";
      const offX   = cosA < -0.2 ? -6 : cosA > 0.2 ? 6 : 0;
      return svgEl("text", {
        x: lx + offX, y: ly,
        "text-anchor": anchor,
        "dominant-baseline": "middle",
        "font-size": "12",
        "font-weight": "bold",
        fill: textColor,
      }, label);
    }

    svg.appendChild(edgeLabel(salidaAngle, ll.salida));
    svg.appendChild(edgeLabel(puestaAngle, ll.puesta));

    // Aguja día (naranja)
    if (dayIdx >= 0) {
      const [nx, ny] = pt(CX, CY, R_OUT + 12, dayMids[dayIdx]);
      svg.appendChild(svgEl("line", {
        x1: CX, y1: CY, x2: nx, y2: ny,
        stroke: "#ff6600", "stroke-width": "3",
      }));
    }
    // Aguja noche (azul)
    if (nightIdx >= 0) {
      const [nx, ny] = pt(CX, CY, R_OUT + 12, nightMids[nightIdx]);
      svg.appendChild(svgEl("line", {
        x1: CX, y1: CY, x2: nx, y2: ny,
        stroke: "#5580cc", "stroke-width": "3",
      }));
    }
    const needleColor = nightIdx >= 0 ? "#5580cc" : "#ff6600";
    svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: "6", fill: needleColor }));

    // Leyenda
    const legend = buildLegend(muhurtasDia, muhurtasNoche, planetNames, isDark);

    // Wrapper flex
    const svgBox = document.createElement("div");
    svgBox.className = "chart-svg-box";
    svgBox.appendChild(svg);

    const wrapper = document.createElement("div");
    wrapper.className = "chart-wrapper";
    wrapper.appendChild(svgBox);
    wrapper.appendChild(legend);

    this.container.innerHTML = "";
    this.container.appendChild(wrapper);
    this.svg = svg;
  }

  clear() {
    this.container.innerHTML = "";
    this.svg = null;
  }
}
