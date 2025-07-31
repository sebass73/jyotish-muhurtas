import { T } from "../utils/i18n.js";

export default class Cards {
  constructor(selector) {
    this.container = document.querySelector(selector);
  }
  clear() {
    this.container.innerHTML = "";
  }
  render(muhurtas) {
    const lang = localStorage.getItem("lang") || "es";
    const planetNames = T[lang].planets;

    muhurtas.forEach((m) => {
      const el = document.createElement("div");
      // el.className = "card";
      el.className = `card ${m.planeta?.toLowerCase() || ""}`;

      const num = `<div class="num">#${m.muhurta}</div>`;
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
