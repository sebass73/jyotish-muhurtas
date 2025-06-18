import { T } from "../utils/i18n.js";

export default function renderAstroTable(containerId, astroPositions) {
  const lang = localStorage.getItem("lang") || "es";
  const tr = T[lang].table;
  const planetsNames = T[lang].planets;
  const signNames = T[lang].signs;

  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Mapas de iconos Unicode para planetas y signos
  const planetIcons = {
    Sol: "☉",
    Luna: "☾",
    Mercurio: "☿",
    Venus: "♀",
    Marte: "♂",
    Júpiter: "♃",
    Saturno: "♄",
    Urano: "♅",
    Neptuno: "♆",
    Plutón: "♇",
  };
  const signIcons = {
    Aries: "♈",
    Tauro: "♉",
    Géminis: "♊",
    Cáncer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Escorpio: "♏",
    Sagitario: "♐",
    Capricornio: "♑",
    Acuario: "♒",
    Piscis: "♓",
  };

  const table = document.createElement("table");
  table.classList.add("astro-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>${tr.planet}</th>
        <th>${tr.sign}</th>
        <th>${tr.degrees}</th>
        <th>${tr.minutes}</th>
        <th>${tr.seconds}</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(astroPositions)
        .map(
          ([pl, pos]) => `
        <tr>
          <td>
            <span class="icon">${planetIcons[pl] || ""}</span>
            ${planetsNames[pl] || pl}
          </td>
          <td>
            <span class="icon">${signIcons[pos.sign] || ""}</span>
            ${signNames[pos.sign] || pos.sign}
          </td>
          <td>${pos.deg}</td>
          <td>${pos.min}</td>
          <td>${pos.sec}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
  container.appendChild(table);
}
