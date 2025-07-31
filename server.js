import express from "express";
import cors from "cors";
import { ejecutarJSON } from "./src/services/core.js";
import { fetchEclLon, toZodiacPosition } from "./src/services/horizons.js";
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";
import { obtenerDatosSol } from "./src/services/sunCalc.js";


const app = express();

app.use(cors());

app.get("/.netlify/functions/sapta", async (req, res) => {
  const params = req.query || {};
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

    // 3) Posiciones planetarias (Horizons)
    const timezone = tzlookup(base.latitude, base.longitude);

    let fechaIso;
    if (usarHora === "true" || usarHora === "on") {
      fechaIso = fecha.includes(" ") ? fecha.replace(" ", "T") : fecha;
    } else {
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

    res.status(200).json({ ...base, astroPositions: astro });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default app;
