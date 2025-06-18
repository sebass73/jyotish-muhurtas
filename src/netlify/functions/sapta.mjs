import { ejecutarJSON } from "../../services/core.js";
import { fetchEclLon, toZodiacPosition } from "../../services/horizons.js";

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  try {
    const data = await ejecutarJSON(params.ciudad, params.pais, params.fecha);
    console.log("Datos de muhurta:", data);
    // return {
    //   statusCode: 200,
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // };
    // 2) Cuerpos a consultar (ID de Horizons)
    const bodies = {
      Sol: "10",
      Luna: "301",
      Mercurio: "199",
      Venus: "299",
      Marte: "499",
      Júpiter: "599",
      Saturno: "699",
      Urano: "799",
      Neptuno: "899",
      Plutón: "999",
    };

    // 3) Consumir Horizons y convertir a DMS + signo
    const positions = {};
    for (const [name, id] of Object.entries(bodies)) {
      console.log(`Consultando ${name} (${id}) para la fecha ${params.fecha}`);
      const dec = await fetchEclLon(id, params.fecha);
      positions[name] = toZodiacPosition(dec);
    }

    // 4) Devolver todo en el JSON
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        astroPositions: positions,
      }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
