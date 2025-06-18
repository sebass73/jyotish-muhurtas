// src/components/AstroTable.js
/**
 * Renderiza una tabla con iconos y datos de posiciones planetarias.
 * @param {string} containerId — id del div donde incrustar la tabla.
 * @param {object} astroPositions — objeto { Sol: {sign,deg,min,sec}, Luna:… }
 */
export default function renderAstroTable(containerId, astroPositions) {
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

  // Construcción de la tabla
  const table = document.createElement("table");
  table.classList.add("astro-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Planeta</th>
        <th>Signo</th>
        <th>Grados</th>
        <th>Minutos</th>
        <th>Segundos</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(astroPositions)
        .map(
          ([planet, pos]) => `
        <tr>
          <td>
            <span class="icon">${planetIcons[planet] || ""}</span>
            ${planet}
          </td>
          <td>
            <span class="icon">${signIcons[pos.sign] || ""}</span>
            ${pos.sign}
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
