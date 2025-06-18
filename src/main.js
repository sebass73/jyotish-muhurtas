// src/main.js
import "./styles/main.css";
import { initI18n, T } from "./utils/i18n.js";
import { initDarkMode } from "./utils/darkMode.js";
import { fetchMuhurtas } from "./services/api.js";
import Form from "./components/Form.js";
import Cards from "./components/Cards.js";
import ChartDisplay from "./components/ChartDisplay.js";
import MapDisplay from "./components/MapDisplay.js";
import renderAstroTable from "./components/AstroTable.js"; // Importar renderAstroTable
import ZodiacChart from "./components/ZodiacChart.js";

export default class MuhurtaApp {
  constructor() {
    initI18n();
    initDarkMode();

    this.form = new Form("#saptaForm");
    this.cards = new Cards("#cards");
    this.chart = new ChartDisplay("#chart");
    this.map = new MapDisplay("#map");
    this.metaDiv = document.getElementById("saptaMeta");
    this.astroContainer = "astroTable"; // id del div para la tabla
    this.lastData = null;

    this.translateUI();
    this.loader = document.getElementById("loader");
    this.results = document.getElementById("results");
    this.bindEvents();
  }

  bindEvents() {
    this.form.onSubmit(async (params) => {
      this._clearAll();
      // this.chart.showLoading();

      this.results.classList.add("hidden");
      this.loader.classList.remove("hidden");
      try {
        const data = await fetchMuhurtas(params);
        this.lastData = data;
        this.renderContent();
      } catch (err) {
        this.form.showError(err.message);
      } finally {
        // this.chart.hideLoading();
        // 3) Siempre: oculta loader
        this.loader.classList.add("hidden");
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
      astroPositions,
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

    // ——— Render tabla de efemérides zodiacales ———
    renderAstroTable(this.astroContainer, astroPositions);
    // const zodiac = new ZodiacChart("zodiacCanvas");
    // zodiac.draw(astroPositions);

    // ——— Render cards, gráfico y mapa ———
    this.cards.render(saptaKrama);
    this.chart.update(saptaKrama);
    this.map.update(latitude, longitude, ciudad, pais);

    // 4) Finalmente, muestra la sección de resultados
    // this.results.classList.remove("hidden");

    // 1) Map y rueda: muévelos tras hacer visibles los contenedores
    this.results.classList.remove("hidden");

    // 2) Mapa (Leaflet) — invalida el tamaño para que se ajuste
    if (this.map.map && typeof this.map.map.invalidateSize === "function") {
      this.map.map.invalidateSize();
    }

    // 3) Rueda zodiacal — redibuja sabiendo ya su tamaño real
    const zodiac = new ZodiacChart("zodiacCanvas");
    zodiac.resizeAndDraw(this.lastData.astroPositions);
  }

  _clearAll() {
    this.metaDiv.style.display = "none";
    this.metaDiv.textContent = "";
    this.cards.clear();
    this.chart.clear?.();
    this.map.clear?.();
    // limpio tabla de efemérides
    document.getElementById(this.astroContainer).innerHTML = "";
  }
}

// Arranque de la aplicación
window.addEventListener("DOMContentLoaded", () => {
  new MuhurtaApp();
});
