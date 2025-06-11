import "./styles/main.css";
import { initI18n } from "./utils/i18n.js";
import { initDarkMode } from "./utils/darkMode.js";
import { fetchMuhurtas } from "./services/api.js";
import Form from "./components/Form.js";
import Cards from "./components/Cards.js";
import ChartDisplay from "./components/ChartDisplay.js";
import MapDisplay from "./components/MapDisplay.js";

async function initApp() {
  initI18n();
  initDarkMode();

  const form = new Form("#saptaForm");
  const cards = new Cards("#cards");
  const chart = new ChartDisplay("#chart");
  const map = new MapDisplay("#map");

  form.onSubmit(async (params) => {
    const metaDiv = document.getElementById("saptaMeta");

    // Limpiar todo lo anterior
    metaDiv.style.display = "none";
    metaDiv.textContent = "";
    cards.clear();
    chart.clear?.();
    map.clear?.();
    chart.showLoading();
    try {
      const data = await fetchMuhurtas(params);
      const { fecha, sunrise, sunset } = data;

      // calculamos arco del sol en minutos
      const [h1, m1] = sunrise.split(":").map(Number);
      const [h2, m2] = sunset.split(":").map(Number);
      const amanecer = new Date();
      amanecer.setHours(h1, m1, 0);
      const atardecer = new Date();
      atardecer.setHours(h2, m2, 0);
      const arcoSol = (atardecer - amanecer) / 60000;

      // muhurtas día y noche
      const muhurtaDia = arcoSol / 12;
      const muhurtaNoche = (1440 - arcoSol) / 12;

      // día de la semana en español
      let diaSemana = new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
      });

      diaSemana = diaSemana
        ? diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
        : "";

      metaDiv.textContent =
        `🗓 Día: ${diaSemana}   🌅 Amanecer: ${sunrise}   🌇 Atardecer: ${sunset}   ` +
        `☀️ Arco del Sol: ${Math.round(arcoSol)} min   ` +
        `🕒 Muhurta Día: ${Math.round(muhurtaDia)} min   ` +
        `🌙 Muhurta Noche: ${Math.round(muhurtaNoche)} min`;

      if (diaSemana) {
        metaDiv.style.display = "flex";
      } else {
        metaDiv.style.display = "none";
      }
      cards.render(data.saptaKrama);
      chart.update(data.saptaKrama);
      map.update(data.latitude, data.longitude, data.ciudad, data.pais);
    } catch (err) {
      console.error(err);
      form.showError(err.message);
    } finally {
      chart.hideLoading();
    }
  });
}

window.addEventListener("DOMContentLoaded", initApp);
