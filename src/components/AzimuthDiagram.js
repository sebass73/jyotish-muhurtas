// src/components/AzimuthDiagram.js

/**
 * Dibuja un diagrama de azimuts centrado, con ejes cardinales y flechas de amanecer/atardecer.
 *
 * @param {number} sunriseAz Grados del azimut de amanecer (0=N, 90=E...)
 * @param {number} sunsetAz  Grados del azimut de atardecer
 * @param {string} sunriseDir Etiqueta cardinal de amanecer (p.ej. "ENE")
 * @param {string} sunsetDir  Etiqueta cardinal de atardecer (p.ej. "WNW")
 */
export function drawAzimuths({ sunriseAz, sunsetAz, sunriseDir, sunsetDir }) {
  const container = document.getElementById("azimuth-container");
  container.innerHTML = "";

  // — detecta si estamos en dark mode como en ChartDisplay —
  const isDark = document.documentElement.classList.contains("dark");
  // Colores dinámicos:
  const AXIS_CLR = isDark ? "#555" : "#ccc";
  const CIRCLE_CLR = isDark ? "#ddd" : "#333";
  const TEXT_CLR = isDark ? "#eee" : "#666";
  const ARROW_RED = isDark ? "#ff8080" : "red";
  const ARROW_BLUE = isDark ? "#80b3ff" : "blue";

  // --- CONFIGURACIÓN BÁSICA (personalízalas a tu gusto) ---
  const SIZE = 250; // ancho / alto total del SVG
  const RADIUS = 100; // radio del círculo principal
  const AXIS_D = 1; // grosor de las líneas de eje punteado
  const CIRCLE_W = 2; // grosor del círculo base
  const ARROW_W = 2; // grosor de las flechas
  const MARKER_S = 3; // tamaño de la punta de flecha
  const FONT_SZ = 14; // tamaño de texto de etiquetas cardinales
  const LABEL_O = 12; // margen radial para N/E/S/W
  const DEG_SZ = 12; // tamaño de texto de grados

  // --- PALANCAS DE AJUSTE FINALES ---
  const RADIAL_OFFSET = 10; // >0 etiquetas más allá de la punta, <0 más cerca
  const X_SHIFT = -30; // <0 acerca etiquetas al eje X=0, >0 las aleja
  const Y_SHIFT = 30; // >0 baja etiquetas, <0 sube etiquetas
  // ---------------------------------------------------------

  // centrar contenedor
  Object.assign(container.style, {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1rem",
    overflow: "visible",
  });

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", SIZE);
  svg.setAttribute("height", SIZE);
  svg.setAttribute(
    "viewBox",
    `${-RADIUS - LABEL_O - 10} ${-RADIUS - LABEL_O - 10} ${
      2 * (RADIUS + LABEL_O + 10)
    } ${2 * (RADIUS + LABEL_O + 10)}`
  );
  svg.style.overflow = "visible";

  // 1) Ejes cardinales
  const axes = [
    { angle: 0, label: "N" },
    { angle: 90, label: "E" },
    { angle: 180, label: "S" },
    { angle: 270, label: "W" },
  ];
  axes.forEach(({ angle, label }) => {
    const theta = (angle * Math.PI) / 180;
    const x2 = RADIUS * Math.sin(theta);
    const y2 = -RADIUS * Math.cos(theta);

    // línea punteada
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", 0);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", AXIS_CLR);
    line.setAttribute("stroke-width", AXIS_D);
    line.setAttribute("stroke-dasharray", "4 4");
    svg.appendChild(line);

    // etiqueta cardinal
    const lx = (RADIUS + LABEL_O) * Math.sin(theta);
    const ly = -(RADIUS + LABEL_O) * Math.cos(theta);
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", lx);
    text.setAttribute("y", ly);
    text.setAttribute("fill", TEXT_CLR);
    text.setAttribute("font-size", FONT_SZ);
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = label;
    svg.appendChild(text);
  });

  // 2) Círculo base
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", 0);
  circle.setAttribute("cy", 0);
  circle.setAttribute("r", RADIUS);
  circle.setAttribute("stroke", CIRCLE_CLR);
  circle.setAttribute("stroke-width", CIRCLE_W);
  circle.setAttribute("fill", "none");
  svg.appendChild(circle);

  // 3) Definición de marcadores
  const defs = document.createElementNS(svgNS, "defs");
  [
    ["red", "arrow-red"],
    ["blue", "arrow-blue"],
  ].forEach(([color, id]) => {
    const m = document.createElementNS(svgNS, "marker");
    m.setAttribute("id", id);
    m.setAttribute("markerWidth", MARKER_S);
    m.setAttribute("markerHeight", MARKER_S);
    m.setAttribute("refX", 0);
    m.setAttribute("refY", MARKER_S / 2);
    m.setAttribute("orient", "auto");
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", `M0,0 L${MARKER_S},${MARKER_S / 2} L0,${MARKER_S} Z`);
    p.setAttribute("fill", color);
    m.appendChild(p);
    defs.appendChild(m);
  });
  svg.appendChild(defs);

  // 4) Función para flechas + etiquetas
  function makeArrow(az, colorId, label) {
    // flecha
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", 0);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", 0);
    line.setAttribute("y2", -RADIUS + 10);
    line.setAttribute(
      "stroke",
      colorId === "arrow-red" ? ARROW_RED : ARROW_BLUE
    );
    line.setAttribute("stroke-width", ARROW_W);
    line.setAttribute("marker-end", `url(#${colorId})`);
    line.setAttribute("transform", `rotate(${az})`);
    svg.appendChild(line);

    // etiqueta de grados
    const theta = (az * Math.PI) / 180;
    const baseR = RADIUS - LABEL_O - 5;
    // posición radial antes de ajuste X/Y
    const tx0 = (baseR + RADIAL_OFFSET) * Math.sin(theta);
    const ty0 = -(baseR + RADIAL_OFFSET) * Math.cos(theta);

    // ajusta X en relación al eje vertical (x=0)
    const tx = tx0 + X_SHIFT * Math.sign(tx0);
    const ty = ty0 + Y_SHIFT;

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", tx);
    text.setAttribute("y", ty);
    const fillColor = colorId === "arrow-red" ? ARROW_RED : ARROW_BLUE;
    text.setAttribute("fill", fillColor);
    text.setAttribute("font-size", DEG_SZ);
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", tx >= 0 ? "start" : "end");
    text.setAttribute("dominant-baseline", ty >= 0 ? "hanging" : "auto");
    text.textContent = `${label} · ${az.toFixed(1)}°`;
    svg.appendChild(text);
  }

  makeArrow(sunriseAz, "arrow-red", sunriseDir);
  makeArrow(sunsetAz, "arrow-blue", sunsetDir);

  container.appendChild(svg);
}
