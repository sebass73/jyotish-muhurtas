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

export default class MuhurtaApp {
  constructor() {
    console.log("Initializing MuhurtaApp...");
    initI18n();
    initDarkMode();

    this.form = new Form("#saptaForm");
    this.initFechaHoraInput();
    const fechaFinal = this.getFechaFinal();
    console.log("Fecha final a usar:", fechaFinal);
    this.cards = new Cards("#cards");
    this.cardsNight = new Cards("#cards-night");
    this.chart = new ChartDisplay("#chart");
    this.map = new MapDisplay("#map");
    this.metaDiv = document.getElementById("saptaMeta");
    this.astroContainer = "astroTable";
    this.lastData = null;
    this.fp = null;
    this.translateUI();
    this.loader = document.getElementById("loader-overlay");
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

  initFechaHoraInput() {
    const fechaInput = document.getElementById("fecha");
    const usarHoraCheckbox = document.getElementById("usarHora");

    const toggleDatetimeMode = () => {
      const usarHora = usarHoraCheckbox.checked;
      const now = new Date();
      now.setSeconds(0, 0);

      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISO = new Date(now - tzOffset).toISOString();

      if (usarHora) {
        fechaInput.type = "datetime-local";
        fechaInput.value = localISO.slice(0, 16); // "YYYY-MM-DDTHH:mm"
      } else {
        fechaInput.type = "date";
        fechaInput.value = localISO.slice(0, 10); // "YYYY-MM-DD"
      }

      // Guardar hora actual para uso posterior
      fechaInput.dataset.horaActual = localISO.slice(11, 16); // "HH:mm"
    };

    toggleDatetimeMode(); // aplicar según estado inicial
    usarHoraCheckbox.addEventListener("change", toggleDatetimeMode);
  }

  getFechaFinal() {
    const usarHora = document.getElementById("usarHora").checked;
    const fechaInput = document.getElementById("fecha");

    if (usarHora) {
      return fechaInput.value;
    } else {
      const fechaBase = fechaInput.value;
      const horaActual = fechaInput.dataset.horaActual || "12:00";
      return `${fechaBase}T${horaActual}`;
    }
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

        const resumenEl = document.querySelector('[id="results"]');
        if (resumenEl) {
          resumenEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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
    console.log("Calculating time slots...");
    const [h1, m1] = sunrise.time.split(":").map(Number);
    const [h2, m2] = sunset.time.split(":").map(Number);
    const t1 = new Date(0);
    t1.setHours(h1, m1, 0);
    const t2 = new Date(0);
    t2.setHours(h2, m2, 0);
    const arcoSolMin = Math.round((t2 - t1) / 60000);
    const diaMinutos = Math.round(arcoSolMin / 12);
    const nocheMinutos = Math.round((1440 - arcoSolMin) / 12);

    console.log("Time slots calculated:");
    // ——— Traducción de labels dinámicos ———
    const lang = localStorage.getItem("lang") || "es";
    const m = T[lang].meta;
    const dtf = new Intl.DateTimeFormat(lang, {
      weekday: "long",
      timeZone: timezone,
    });
    const rawWeekday = dtf.format(new Date(fecha.replace(" ", "T")));
    const weekday = rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);

    console.log("Rendering metadata...");
    // ——— Render metadata ———
    this.metaDiv.textContent =
      `🗓 ${m.day}: ${weekday}   ` +
      `🌅 ${m.sunrise}: ${sunrise.time}   ` +
      `🌇 ${m.sunset}: ${sunset.time}   ` +
      `☀️ ${m.solarArc}: ${arcoSolMin} min   ` +
      `🕒 ${m.daySlots}: ${diaMinutos} min   ` +
      `🌙 ${m.nightSlots}: ${nocheMinutos} min`;
    this.metaDiv.style.display = diaSemana ? "flex" : "none";

    console.log("Rendering astro table...");
    // ——— Render tabla de efemérides zodiacales ———
    renderAstroTable(this.astroContainer, astroPositions);

    console.log("Rendering cards, chart, and map...");
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

    console.log("Drawing azimuth diagram...");
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

    console.log("Content rendered successfully");
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
