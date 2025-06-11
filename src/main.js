// src/main.js
import "./styles/main.css";
import { initI18n, T } from "./utils/i18n.js";
import { initDarkMode } from "./utils/darkMode.js";
import { fetchMuhurtas } from "./services/api.js";
import Form from "./components/Form.js";
import Cards from "./components/Cards.js";
import ChartDisplay from "./components/ChartDisplay.js";
import MapDisplay from "./components/MapDisplay.js";

export default class MuhurtaApp {
  constructor() {
    initI18n();
    initDarkMode();

    this.form = new Form("#saptaForm");
    this.cards = new Cards("#cards");
    this.chart = new ChartDisplay("#chart");
    this.map = new MapDisplay("#map");
    this.metaDiv = document.getElementById("saptaMeta");
    this.lastData = null;

    this.translateUI();

    this.bindEvents();
  }

  bindEvents() {
    this.form.onSubmit(async (params) => {
      this._clearAll();
      this.chart.showLoading();
      try {
        const data = await fetchMuhurtas(params);
        this.lastData = data;
        this.renderContent();
      } catch (err) {
        this.form.showError(err.message);
      } finally {
        this.chart.hideLoading();
      }
    });

    document.getElementById("lang").addEventListener("change", (e) => {
      localStorage.setItem("lang", e.target.value);
      this.translateUI();
      if (this.lastData) this.renderContent();
    });
  }

  translateUI() {
    const lang = localStorage.getItem("lang") || "es";
    const t = T[lang];

    document.title = t.title;
    document.querySelector("h1").textContent = t.title;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t[el.getAttribute("data-i18n")];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t[el.getAttribute("data-i18n-placeholder")];
    });
  }

  renderContent() {
    const {
      fecha,
      sunrise,
      sunset,
      diaSemana,
      arcoSol,
      latitude,
      longitude,
      ciudad,
      pais,
      saptaKrama,
    } = this.lastData;

    this.cards.clear();

    // ——— Cálculos de minutos ———
    const [h1, m1] = sunrise.split(":").map(Number);
    const [h2, m2] = sunset.split(":").map(Number);
    const t1 = new Date(0);
    t1.setUTCHours(h1, m1, 0);
    const t2 = new Date(0);
    t2.setUTCHours(h2, m2, 0);
    const arcoSolMin = Math.round((t2 - t1) / 60000);
    const diaMinutos = Math.round(arcoSolMin / 12);
    const nocheMinutos = Math.round((1440 - arcoSolMin) / 12);

    // ——— Traducción de labels dinámicos ———
    const lang = localStorage.getItem("lang") || "es";
    const m = T[lang].meta;
    const weekday = new Date(fecha)
      .toLocaleDateString(lang, { weekday: "long" })
      .replace(/^./, (c) => c.toUpperCase());

    // ——— Render metadata ———
    this.metaDiv.textContent =
      `🗓 ${m.day}: ${weekday}   ` +
      `🌅 ${m.sunrise}: ${sunrise}   ` +
      `🌇 ${m.sunset}: ${sunset}   ` +
      `☀️ ${m.solarArc}: ${arcoSolMin} min   ` +
      `🕒 ${m.daySlots}: ${diaMinutos} min   ` +
      `🌙 ${m.nightSlots}: ${nocheMinutos} min`;
    this.metaDiv.style.display = diaSemana ? "flex" : "none";

    // ——— Render cards, gráfico y mapa ———
    this.cards.render(saptaKrama);
    this.chart.update(saptaKrama);
    this.map.update(latitude, longitude, ciudad, pais);
  }

  _clearAll() {
    this.metaDiv.style.display = "none";
    this.metaDiv.textContent = "";
    this.cards.clear();
    this.chart.clear?.();
    this.map.clear?.();
  }
}

// Arranque de la aplicación
window.addEventListener("DOMContentLoaded", () => {
  new MuhurtaApp();
});
