import { T } from "../utils/i18n.js";

export default class ZodiacChart {
  constructor(canvasId) {
    const lang = localStorage.getItem("lang") || "es";
    this.signs = Object.values(T[lang].signs);
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // Mapeo de símbolos planetarios (Unicode)
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

    // Lista de signos en orden zodiacal
    // this.signs = [
    //   "Aries",
    //   "Tauro",
    //   "Géminis",
    //   "Cáncer",
    //   "Leo",
    //   "Virgo",
    //   "Libra",
    //   "Escorpio",
    //   "Sagitario",
    //   "Capricornio",
    //   "Acuario",
    //   "Piscis",
    // ];

    // Colores para aspectos: conjunción/oposición rojo, trígono/sextil verde, cuadratura azul
    this.aspectColors = {
      conjunction: "#e74c3c",
      opposition: "#e74c3c",
      trine: "#2ecc71",
      sextile: "#2ecc71",
      square: "#3498db",
    };

    // Orbe de tolerancia en grados para detectar aspecto
    this.orb = 2;

    // Estado hover
    this.hovered = null;

    // Eventos para hover (desktop: mousemove, mouseleave; mobile: click, touchstart)
    // this.canvas.addEventListener("mousemove", (e) => this._onMouseMove(e));
    // this.canvas.addEventListener("mouseleave", () => this._onMouseLeave());
    // this.canvas.addEventListener("click", (e) => this._onMouseMove(e));
    // this.canvas.addEventListener("touchstart", (e) => {
    //   const touch = e.touches[0];
    //   this._onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    //   e.preventDefault();
    // });
    this.canvas.addEventListener("pointermove", (e) => this._onPointer(e));
    this.canvas.addEventListener("pointerdown", (e) => this._onPointer(e));
    this.canvas.addEventListener("pointerleave", () => this._onPointerLeave());

    // Redibuja si ventana cambia de tamaño
    window.addEventListener("resize", () => this.resizeAndDraw());

    // Primer render
    this.resizeAndDraw();
  }
  _onPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * scale - this.size / 2;
    const y = (e.clientY - rect.top) * scale - this.size / 2;
    let found = null;
    for (const pt of this.pts) {
      const dx = x - pt.x * scale;
      const dy = y - pt.y * scale;
      if (Math.hypot(dx, dy) < 10) {
        found = pt;
        break;
      }
    }
    if (found !== this.hovered) {
      this.hovered = found;
      // Redibuja solo el gráfico manteniendo dimensiones
      this.draw(this.lastPositions);
    }
  }

  _onPointerLeave() {
    if (this.hovered) {
      this.hovered = null;
      this.draw(this.lastPositions);
    }
  }

  //   _onMouseMove(e) {
  //     const rect = this.canvas.getBoundingClientRect();
  //     const scale = window.devicePixelRatio || 1;
  //     const x = (e.clientX - rect.left) * scale - this.size / 2;
  //     const y = (e.clientY - rect.top) * scale - this.size / 2;

  //     let found = null;
  //     // Detecta si cursor sobre punto de planeta (10px)
  //     for (const pt of this.pts) {
  //       const dx = x - pt.x * scale;
  //       const dy = y - pt.y * scale;
  //       if (Math.hypot(dx, dy) < 10) {
  //         found = pt;
  //         break;
  //       }
  //     }
  //     if (found !== this.hovered) {
  //       this.hovered = found;
  //       this.resizeAndDraw(this.lastPositions);
  //     }
  //   }

  //   _onMouseLeave() {
  //     this.hovered = null;
  //     this.resizeAndDraw(this.lastPositions);
  //   }

  resizeAndDraw(positions = this.lastPositions) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * scale;
    this.canvas.height = rect.width * scale;
    this.ctx.scale(scale, scale);

    // Tamaño y radios
    this.size = rect.width;
    this.radius = (this.size / 2) * 0.8; // ajusta 0.8 para cambiar círculo exterior
    this.innerRadius = this.radius * 0.6; // ajusta 0.6 para cambio círculo interior

    if (positions) this.draw(positions);
  }

  draw(astroPositions) {
    this.lastPositions = astroPositions;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(this.size / 2, this.size / 2);

    // 1) Círculo exterior (eclíptica)
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#bdc3c7"; // color borde exterior
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2) Radios zodiacales: subdivide cada 30°
    ctx.strokeStyle = "#bdc3c7";
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 - 90) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
      ctx.stroke();
    }

    // 3) Círculo interior
    ctx.beginPath();
    ctx.arc(0, 0, this.innerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#bdc3c7";
    ctx.stroke();

    // 4) Etiquetas de signos
    ctx.fillStyle = "#2c3e50"; // color etiquetas
    ctx.font = "bold 12px sans-serif";
    this.signs.forEach((sign, i) => {
      const mid = ((i * 30 + 15 + 135) * Math.PI) / 180; // +135° para arco abajo-izq
      const x = (this.radius + 20) * Math.cos(mid);
      const y = (this.radius + 20) * Math.sin(mid);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillText(sign, 0, 0);
      ctx.restore();
    });

    // 5) Calcula posiciones planetas
    this.pts = Object.entries(astroPositions).map(([name, pos]) => {
      const deg =
        this.signs.indexOf(pos.sign) * 30 +
        pos.deg +
        pos.min / 60 +
        pos.sec / 3600;
      const theta = ((deg + 135) * Math.PI) / 180; // +135° desfase
      const r = (this.innerRadius + this.radius) / 2; // radio para planetas
      return { name, deg, x: r * Math.cos(theta), y: r * Math.sin(theta) };
    });

    // 6) Dibujar líneas de aspecto
    const aspects = {
      0: "conjunction",
      60: "sextile",
      90: "square",
      120: "trine",
      180: "opposition",
    };
    for (let i = 0; i < this.pts.length; i++) {
      for (let j = i + 1; j < this.pts.length; j++) {
        let diff = Math.abs(this.pts[i].deg - this.pts[j].deg);
        diff = diff > 180 ? 360 - diff : diff;
        for (const [angle, asp] of Object.entries(aspects)) {
          if (Math.abs(diff - angle) <= this.orb) {
            ctx.beginPath();
            ctx.moveTo(this.pts[i].x, this.pts[i].y);
            ctx.lineTo(this.pts[j].x, this.pts[j].y);
            ctx.strokeStyle = this.aspectColors[asp]; // color según aspecto
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // 7) Dibujar puntos planetas
    this.pts.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#e74c3c";
      ctx.fill();
    });

    // 8) Etiqueta hover (símbolo y nombre)
    if (this.hovered) {
      const pt = this.hovered;
      const symbol = this.planetSymbols[pt.name] || "";
      const text = `${symbol} ${pt.name}`;
      ctx.font = "12px sans-serif";
      ctx.textAlign = pt.x >= 0 ? "left" : "right";
      ctx.textBaseline = "bottom";
      const tx = pt.x + (pt.x >= 0 ? 8 : -8);
      const ty = pt.y - 8;
      const m = ctx.measureText(text);
      // fondo
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(tx - (pt.x >= 0 ? 0 : m.width), ty - 14, m.width + 4, 18);
      // texto
      ctx.fillStyle = "#2c3e50";
      ctx.fillText(text, tx, ty);
    }

    ctx.restore();
  }
}
