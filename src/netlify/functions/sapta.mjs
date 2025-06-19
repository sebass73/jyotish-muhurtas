import { ejecutarJSON } from "../../services/core.js";
import { fetchEclLon, toZodiacPosition } from "../../services/horizons.js";
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  try {
    const data = await ejecutarJSON(params.ciudad, params.pais, params.fecha);

    // Zona local
    const timezone = tzlookup(data.latitude, data.longitude);
    const nowLocal = DateTime.now().setZone(timezone);

    const nowUtc = nowLocal.toUTC(); // pasa a “2025-Jun-19T14:42:…” UTC
    const plusOneMin = nowUtc.plus({ minutes: 1 }); // intervalo de 1 minuto

    const fmt = (d) => d.toFormat("yyyy-LLL-dd HH:mm"); // e.g. "2025-Jun-19 14:42"
    const startStr = fmt(nowUtc);
    const stopStr = fmt(plusOneMin);

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
      const dec = await fetchEclLon(id, startStr, stopStr);
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
