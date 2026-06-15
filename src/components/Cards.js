import { T } from "../utils/i18n.js";
import { activeMuhurtaIndex, PLANET_ICONS } from "../utils/constants.js";

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
    const curIdx = activeMuhurtaIndex(muhurtas);

    muhurtas.forEach((m, i) => {
      const el = document.createElement("div");
      const activeClass = i === curIdx ? " card--active" : "";
      el.className = `card ${m.planeta?.toLowerCase() || ""}${activeClass}`;

      const num = `<div class="num">#${m.muhurta}</div>`;
      const time = `<div class="time">${m.inicio} → ${m.fin}</div>`;

      let planetHtml = "";
      if (m.planeta) {
        const key  = m.planeta.toLowerCase();
        const name = planetNames[m.planeta] || m.planeta;
        const icon = PLANET_ICONS[key] ?? "";
        planetHtml = `<div class="planet ${key}"><span class="planet-icon">${icon}</span> ${name}</div>`;
      }

      el.innerHTML = num + time + planetHtml;
      this.container.appendChild(el);
    });
  }
}
