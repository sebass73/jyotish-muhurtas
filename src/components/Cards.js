import { T } from "../utils/i18n.js";

export default class Cards {
  constructor(selector, isNight = false) {
    this.container = document.querySelector(selector);
    this.isNight = isNight;
  }
  clear() {
    this.container.innerHTML = "";
  }
  render(muhurtas) {
    const lang = localStorage.getItem("lang") || "es";
    const planetNames = T[lang].planets;

    muhurtas.forEach((m) => {
      const el = document.createElement("div");
      el.className = "card";

      // icono 🌙 sólo si es noche
      const icon = this.isNight ? "🌙 " : "";

      const num = `<div class="num">${icon}#${m.muhurta}</div>`;
      const time = `<div class="time">${m.inicio} → ${m.fin}</div>`;

      // si tiene planeta, mostramos su nombre traducido
      let planetHtml = "";
      if (m.planeta) {
        const name = planetNames[m.planeta] || m.planeta;
        planetHtml = `<div class="planet ${m.planeta.toLowerCase()}">${name}</div>`;
      }

      el.innerHTML = num + time + planetHtml;
      this.container.appendChild(el);
    });
  }
}
