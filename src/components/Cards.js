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
      el.className = "card";
      const name = planetNames[m.planeta] || m.planeta;
      el.innerHTML = `
        <div class="num">#${m.muhurta}</div>
        <div class="time">${m.inicio} → ${m.fin}</div>
        <div class="planet ${m.planeta.toLowerCase()}">${name}</div>
      `;
      this.container.appendChild(el);
    });
  }
}
