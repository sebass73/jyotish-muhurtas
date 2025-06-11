import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { PLANET_SYMBOLS, PLANET_COLORS } from "../utils/constants.js";
import { T } from "../utils/i18n.js";

Chart.register(ChartDataLabels);

export default class ChartDisplay {
  constructor(selector) {
    this.ctx = document.querySelector(selector).getContext("2d");
    this.chart = null;
  }
  showLoading() {
    // TODO: overlay o loader si hace falta
  }
  hideLoading() {
    // TODO: quitar overlay
  }
  update(muhurtas) {
    const isDark = document.documentElement.classList.contains("dark");
    const labelColor = isDark ? "#e0e0e0" : "#000000";
    const lang = localStorage.getItem("lang") || "es";
    console.log(lang)
    const planetNames = T[lang].planets;
    console.log(planetNames);
    // const labels = muhurtas.map((m, i) => PLANET_SYMBOLS[i] || m.planeta);
    // const labels = muhurtas.map((m) => m.planeta);
    const labels = muhurtas.map((m) => planetNames[m.planeta] || m.planeta);
    const colors = muhurtas.map(
      (m) => PLANET_COLORS[m.planeta.toLowerCase()] || "#ccc"
    );
    const data = Array(labels.length).fill(1);

    const config = {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: "50%",
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        layout: {
          padding: {
            top: 50,
            bottom: 40,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const m = muhurtas[ctx.dataIndex];
                return `${m.inicio}–${m.fin}`;
              },
            },
          },
          legend: { display: false },
          datalabels: {
            formatter: (v, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            anchor: "end",
            align: "end",
            offset: 10,
            font: { size: 14 },
            color: labelColor,
          },
        },
      },
    };

    if (this.chart) {
      // override options y refrescar
      this.chart.options = config.options;
      this.chart.data = config.data;
      this.chart.update();
    } else {
      // crear nueva instancia
      this.chart = new Chart(this.ctx, config);
    }
  }

  // Nuevo método para limpiar el chart anterior
  clear() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
