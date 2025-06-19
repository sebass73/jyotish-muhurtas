import { T } from "../utils/i18n.js";

export default class ZodiacChart {
  constructor(canvasId) {
    // Idioma actual (por defecto 'es')
    const lang = localStorage.getItem("lang") || "es";

    // Aunque T[lang].signs contiene las traducciones, aquí forzamos siempre el orden zodiacal
    // tal como lo usamos al parsear con toZodiacPosition (español con acentos) :contentReference[oaicite:3]{index=3}
    this.zodiacOrder = [
      "Aries",
      "Tauro",
      "Géminis",
      "Cáncer",
      "Leo",
      "Virgo",
      "Libra",
      "Escorpio",
      "Sagitario",
      "Capricornio",
      "Acuario",
      "Piscis",
    ];

    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // Detectar si es móvil
    this.isMobile =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    // Símbolos planetarios
    this.planetSymbols = {
      Sol: "☉",
      Luna: "☾",
      Mercurio: "☿",
      Venus: "♀",
      Marte: "♂",
      Júpiter: "♃",
      Saturno: "♄",
      Urano: "♅",
      Neptuno: "♆",
      Plutón: "♇",
    };

    // Colores de aspectos
    this.aspectColors = {
      conjunction: "#e74c3c",
      opposition: "#e74c3c",
      trine: "#2ecc71",
      sextile: "#2ecc71",
      square: "#3498db",
      semisextile: "#f1c40f",
      quincunx: "#9b59b6",
      sesquisquare: "#e67e22",
    };
    this.orb = 5; // tolerancia de orbe

    this.hovered = null;

    // Eventos de interacción
    this.canvas.addEventListener("mousemove", (e) => this._onMouseMove(e));
    this.canvas.addEventListener("mouseleave", () => this._onMouseLeave());
    this.canvas.addEventListener("click", (e) => this._onMouseMove(e));
    this.canvas.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      this._onMouseMove({ clientX: t.clientX, clientY: t.clientY });
      e.preventDefault();
    });

    window.addEventListener("resize", () => this.resizeAndDraw());

    // Dibujo inicial
    this.resizeAndDraw();
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left - this.size / 2;
    const y = e.clientY - r.top - this.size / 2;
    let found = null;
    for (const pt of this.pts) {
      if (Math.hypot(x - pt.x, y - pt.y) < 10) {
        found = pt;
        break;
      }
    }
    if (found !== this.hovered) {
      this.hovered = found;
      this.resizeAndDraw(this.lastPositions);
    }
  }

  _onMouseLeave() {
    this.hovered = null;
    this.resizeAndDraw(this.lastPositions);
  }

  resizeAndDraw(positions = this.lastPositions) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(dpr, dpr);

    this.size = rect.width;
    this.radius = (this.size / 2) * 0.8;
    this.innerRadius = this.radius * 0.6;

    if (positions) this.draw(positions);
  }

  draw(astroPositions) {
    this.lastPositions = astroPositions;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(this.size / 2, this.size / 2);

    // 1) Círculo exterior
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2) Radios zodiacales
    ctx.strokeStyle = "#bdc3c7";
    for (let i = 0; i < 12; i++) {
      const ang = ((i * 30 - 90) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.radius * Math.cos(ang), this.radius * Math.sin(ang));
      ctx.stroke();
    }

    // 3) Círculo interior
    ctx.beginPath();
    ctx.arc(0, 0, this.innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 4) Etiquetas de signos
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 12px sans-serif";
    this.zodiacOrder.forEach((sign, i) => {
      const mid = ((i * 30 + 15 - 90) * Math.PI) / 180;
      const x = (this.radius + 20) * Math.cos(mid);
      const y = (this.radius + 20) * Math.sin(mid);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillText(sign, 0, 0);
      ctx.restore();
    });

    // 5) Calculamos posición de cada planeta
    this.pts = Object.entries(astroPositions).map(([name, pos]) => {
      const idx = this.zodiacOrder.indexOf(pos.sign);
      if (idx < 0) console.warn(`Signo desconocido: ${pos.sign}`);
      const totalDeg = idx * 30 + pos.deg + pos.min / 60 + pos.sec / 3600;
      // Convertir al sistema canvas: restamos 90° para poner 0° Aries arriba
      const theta = (totalDeg * Math.PI) / 180 - Math.PI / 2;
      // Radio proporcional al grado dentro del signo
      const frac = (pos.deg + pos.min / 60 + pos.sec / 3600) / 30;
      const r = this.innerRadius + frac * (this.radius - this.innerRadius);
      return {
        name,
        deg: totalDeg,
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      };
    });

    // 6) Líneas de aspecto
    const aspects = {
      0: "conjunction",
      30: "semisextile",
      45: "sesquisquare",
      60: "sextile",
      90: "square",
      120: "trine",
      150: "quincunx",
      180: "opposition",
    };
    for (let i = 0; i < this.pts.length; i++) {
      for (let j = i + 1; j < this.pts.length; j++) {
        let diff = Math.abs(this.pts[i].deg - this.pts[j].deg);
        diff = diff > 180 ? 360 - diff : diff;
        for (const ang in aspects) {
          if (Math.abs(diff - ang) <= this.orb) {
            ctx.beginPath();
            ctx.moveTo(this.pts[i].x, this.pts[i].y);
            ctx.lineTo(this.pts[j].x, this.pts[j].y);
            ctx.strokeStyle = this.aspectColors[aspects[ang]];
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // 7) Puntos planetarios
    this.pts.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#e74c3c";
      ctx.fill();
    });

    // 8) Etiquetas on-hover (o en móvil siempre)
    if (this.isMobile) {
      this.pts.forEach((pt) => this._drawTooltip(pt));
    } else if (this.hovered) {
      this._drawTooltip(this.hovered);
    }

    ctx.restore();
  }

  _drawTooltip(pt) {
    const ctx = this.ctx;
    const sym = this.planetSymbols[pt.name] || "";
    const txt = `${sym} ${pt.name}`;
    ctx.font = "12px sans-serif";
    ctx.textAlign = pt.x >= 0 ? "left" : "right";
    ctx.textBaseline = "bottom";
    const tx = pt.x + (pt.x >= 0 ? 8 : -8);
    const ty = pt.y - 8;
    const m = ctx.measureText(txt);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(tx - (pt.x >= 0 ? 0 : m.width), ty - 14, m.width + 4, 18);
    ctx.fillStyle = "#2c3e50";
    ctx.fillText(txt, tx, ty);
  }
}
