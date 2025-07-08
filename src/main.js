// src/main.js
import "./styles/main.css";
import { initI18n, T } from "./utils/i18n.js";
import { initDarkMode } from "./utils/darkMode.js";
import { fetchMuhurtas } from "./services/api.js";
import Form from "./components/Form.js";
import Cards from "./components/Cards.js";
import ChartDisplay from "./components/ChartDisplay.js";
import MapDisplay from "./components/MapDisplay.js";
import renderAstroTable from "./components/AstroTable.js";
import ZodiacChart from "./components/ZodiacChart.js";
import { drawAzimuths } from "./components/AzimuthDiagram.js";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import English from "flatpickr/dist/l10n/default.js";
import { Italian } from "flatpickr/dist/l10n/it.js";
import "flatpickr/dist/flatpickr.min.css";

export default class MuhurtaApp {
  constructor() {
    initI18n();
    initDarkMode();

    this.form = new Form("#saptaForm");
    this.cards = new Cards("#cards", false);
    this.cardsNight = new Cards("#cards-night", true);
    this.chart = new ChartDisplay("#chart");
    this.map = new MapDisplay("#map");
    this.metaDiv = document.getElementById("saptaMeta");
    this.astroContainer = "astroTable";
    this.lastData = null;

    this.translateUI();
    this.initDatePicker();
    this.loader = document.getElementById("loader");
    this.results = document.getElementById("results");
    this.bindEvents();

    window.addEventListener("themeChange", () => {
      if (this.lastData) {
        // Redibuja el diagrama SVG con colores actualizados
        drawAzimuths({
          sunriseAz: this.lastData.sunrise.azimuth,
          sunriseDir: this.lastData.sunrise.direction,
          sunsetAz: this.lastData.sunset.azimuth,
          sunsetDir: this.lastData.sunset.direction,
        });
        this.chart.update(this.lastData.saptaKramaDia);
      }
      if (this.zodiac) {
        this.zodiac.resizeAndDraw(this.lastData.astroPositions);
      }
    });
  }

  bindEvents() {
    this.form.onSubmit(async (params) => {
      this._clearAll();
      this.results.classList.add("hidden");
      this.loader.classList.remove("hidden");
      try {
        const data = await fetchMuhurtas(params);
        this.lastData = data;
        this.renderContent();
      } catch (err) {
        this.form.showError(err.message);
      } finally {
        this.loader.classList.add("hidden");
      }
    });

    document.getElementById("lang").addEventListener("change", (e) => {
      localStorage.setItem("lang", e.target.value);
      this.translateUI();
      this.initDatePicker();
      if (this.lastData) this.renderContent();
    });
  }

  translateUI() {
    const lang = localStorage.getItem("lang") || "es";
    const t = T[lang];

    // título de la pestaña
    document.title = t.title;
    document.querySelector("h1").textContent = t.title;

    // 1) primero los que llevan HTML
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t[key] || "";
    });

    // 2) luego los que son solo texto
    document
      .querySelectorAll("[data-i18n]:not([data-i18n-html])")
      .forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t[key] || "";
      });

    // 3) placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = t[key] || "";
    });
  }

  initDatePicker() {
    const lang = localStorage.getItem("lang") || "es";
    const locales = { es: Spanish, en: English, it: Italian };

    // Flatpickr sobre el #fecha
    flatpickr("#fecha", {
      locale: locales[lang] || Spanish,
      dateFormat: "Y-m-d", // valor que envía al servidor (YYYY-MM-DD)
      altInput: true,
      altFormat: "d/m/Y", // formato visible en la UI
      allowInput: true,
      defaultDate: new Date(),
      prevArrow: "‹",
      nextArrow: "›",
      // Si quisieras manejar cambios manuales:
      onChange: ([d]) => {
        // por defecto Form lee el value de #fecha en formato Y-m-d
      },
    });
  }

  renderContent() {
    const {
      fecha,
      sunrise,
      sunset,
      diaSemana,
      latitude,
      longitude,
      ciudad,
      pais,
      saptaKramaDia,
      saptaKramaNoche,
      astroPositions,
      timezone,
    } = this.lastData;

    this.cards.clear();

    // ——— Cálculos de minutos ———
    const [h1, m1] = sunrise.time.split(":").map(Number);
    const [h2, m2] = sunset.time.split(":").map(Number);
    const t1 = new Date(0);
    t1.setHours(h1, m1, 0);
    const t2 = new Date(0);
    t2.setHours(h2, m2, 0);
    const arcoSolMin = Math.round((t2 - t1) / 60000);
    const diaMinutos = Math.round(arcoSolMin / 12);
    const nocheMinutos = Math.round((1440 - arcoSolMin) / 12);

    // ——— Traducción de labels dinámicos ———
    const lang = localStorage.getItem("lang") || "es";
    const m = T[lang].meta;
    const dtf = new Intl.DateTimeFormat(lang, {
      weekday: "long",
      timeZone: timezone,
    });
    const rawWeekday = dtf.format(new Date(`${fecha}T00:00:00`));
    const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);

    // ——— Render metadata ———
    this.metaDiv.textContent =
      `🗓 ${m.day}: ${weekday}   ` +
      `🌅 ${m.sunrise}: ${sunrise.time}   ` +
      `🌇 ${m.sunset}: ${sunset.time}   ` +
      `☀️ ${m.solarArc}: ${arcoSolMin} min   ` +
      `🕒 ${m.daySlots}: ${diaMinutos} min   ` +
      `🌙 ${m.nightSlots}: ${nocheMinutos} min`;
    this.metaDiv.style.display = diaSemana ? "flex" : "none";

    // ——— Render tabla de efemérides zodiacales ———
    renderAstroTable(this.astroContainer, astroPositions);

    // ——— Render cards, gráfico y mapa ———
    this.cards.render(saptaKramaDia);
    this.chart.update(saptaKramaDia);
    this.cardsNight.clear();
    this.cardsNight.render(saptaKramaNoche);
    this.map.update(latitude, longitude, ciudad, pais);

    // 1) Map y rueda: muévelos tras hacer visibles los contenedores
    this.results.classList.remove("hidden");

    // 2) Mapa (Leaflet) — invalida el tamaño para que se ajuste
    if (this.map.map && typeof this.map.map.invalidateSize === "function") {
      this.map.map.invalidateSize();
    }

    // Dibuja diagrama de azimuts
    drawAzimuths({
      sunriseAz: sunrise.azimuth,
      sunriseDir: sunrise.direction,
      sunsetAz: sunset.azimuth,
      sunsetDir: sunset.direction,
    });

    // 3) Rueda zodiacal — redibuja sabiendo ya su tamaño real
    // const zodiac = new ZodiacChart("zodiacCanvas");
    // zodiac.resizeAndDraw(this.lastData.astroPositions);
    if (!this.zodiac) {
      this.zodiac = new ZodiacChart("zodiacCanvas");
    }
    this.zodiac.resizeAndDraw(this.lastData.astroPositions);
  }

  _clearAll() {
    this.metaDiv.style.display = "none";
    this.metaDiv.textContent = "";
    this.cards.clear();
    this.chart.clear?.();
    this.map.clear?.();
    // limpio tabla de efemérides
    document.getElementById(this.astroContainer).innerHTML = "";
    document.getElementById("azimuth-container").innerHTML = "";
  }
}

// Arranque de la aplicación
window.addEventListener("DOMContentLoaded", () => {
  new MuhurtaApp();
});
