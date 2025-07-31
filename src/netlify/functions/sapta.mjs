import { ejecutarJSON } from "../../services/core.js";
import { fetchEclLon, toZodiacPosition } from "../../services/horizons.js";
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";
import { obtenerDatosSol } from "../../services/sunCalc.js";

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { ciudad, pais, fecha, usarHora } = params;
  try {
    // 1) Base: muhûrtas, posiciones eclípticas, etc.
    const base = await ejecutarJSON(ciudad, pais, fecha);
    // 2) Azimuts de Sol con SunCalc
    const sol = await obtenerDatosSol(ciudad, pais, fecha);
    base.sunrise.azimuth = sol.sunriseAzimuth;
    base.sunrise.direction = sol.sunriseDirection;
    base.sunset.azimuth = sol.sunsetAzimuth;
    base.sunset.direction = sol.sunsetDirection;

    // 3) Posiciones planetarias (Horizons) --- lógica original
    const timezone = tzlookup(base.latitude, base.longitude);

    // Normaliza a formato ISO válido
    let fechaIso;
    if (usarHora === "true" || usarHora === "on") {
      // Si viene con espacio, convertilo a ISO
      fechaIso = fecha.includes(" ") ? fecha.replace(" ", "T") : fecha;
    } else {
      // Usa solo la parte de la fecha
      fechaIso = fecha.split("T")[0] + "T00:00:00";
    }

    const nowLocal = DateTime.fromISO(fechaIso, { zone: timezone });
    const nowUtc = nowLocal.toUTC();
    const startStr = nowUtc.toFormat("yyyy-LLL-dd HH:mm");
    const stopStr = nowUtc.plus({ minutes: 1 }).toFormat("yyyy-LLL-dd HH:mm");
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
    const astro = {};
    for (const [name, id] of Object.entries(bodies)) {
      const dec = await fetchEclLon(id, startStr, stopStr);
      astro[name] = toZodiacPosition(dec);
    }
    // 4) Devolver todo junto
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...base, astroPositions: astro }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
