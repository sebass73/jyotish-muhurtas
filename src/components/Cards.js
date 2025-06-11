export default class Cards {
  constructor(selector) {
    this.container = document.querySelector(selector);
  }
  clear() {
    this.container.innerHTML = "";
  }
  render(muhurtas) {
    muhurtas.forEach((m) => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <div class="num">#${m.muhurta}</div>
        <div class="time">${m.inicio} → ${m.fin}</div>
        <div class="planet ${m.planeta.toLowerCase()}">${m.planeta}</div>
      `;
      this.container.appendChild(el);
    });
  }
}
