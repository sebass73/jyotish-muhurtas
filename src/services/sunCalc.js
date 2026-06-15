import axios from "axios";
import tzlookup from "tz-lookup";
import SunCalc from "suncalc";
import { DateTime } from "luxon";

/**
 * Geocodifica y obtiene datos solares con azimut y dirección cardinal
 */
export async function obtenerDatosSol(ciudad, pais, fechaISO) {
  // 1) Geocoding (mantén tu lógica actual si difiere)
  const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: `${ciudad}, ${pais}`, format: "json", limit: 1 },
    headers: { "User-Agent": "JyotishYogaApp/1.0" },
  });
  if (!geo.data.length) throw new Error("Ciudad no encontrada");
  const lat = parseFloat(geo.data[0].lat);
  const lon = parseFloat(geo.data[0].lon);
  const zone = tzlookup(lat, lon);

  // 2) Calcular amanecer/atardecer
  // Asegura que la fecha esté en formato ISO válido
  if (fechaISO.includes(" ")) {
    fechaISO = fechaISO.replace(" ", "T");
  }
  const d = DateTime.fromISO(fechaISO, { zone }).toJSDate();
  const times = SunCalc.getTimes(d, lat, lon);
  // 3) Posición y azimut
  const sunriseDT = DateTime.fromJSDate(times.sunrise, { zone });
  const sunsetDT = DateTime.fromJSDate(times.sunset, { zone });
  const risePos = SunCalc.getPosition(times.sunrise, lat, lon);
  const setPos = SunCalc.getPosition(times.sunset, lat, lon);
  // CORREGIDO: 0°=Norte, sentido horario (convención astronómica)
  const toDeg = (r) => ((r * 180) / Math.PI + 180) % 360;
  const azRise = toDeg(risePos.azimuth);
  const azSet = toDeg(setPos.azimuth);
  // 4) Punto cardinal
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const cardinal = (deg) => dirs[Math.round(deg / 45) % 8];

  // 5) Moon illumination + phase
  const moonIllum = SunCalc.getMoonIllumination(d);
  const moonTimes = SunCalc.getMoonTimes(d, lat, lon);

  // Emoji: 8 fases visuales
  const PHASE_EMOJIS = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];
  const phaseIdx     = Math.round(moonIllum.phase * 8) % 8;

  // Nombre védico: 4 estados de ±3.7 días alrededor de cada pico
  // Ciclo ~29.53 días → cada cuarto = 0.25; margen = 0.125
  const p = moonIllum.phase;
  const vedicKey =
    (p < 0.125 || p >= 0.875) ? "amavasya"  :
    p < 0.375                  ? "pratipada" :
    p < 0.625                  ? "purnima"   :
                                 "anumati";

  const fmtMoon = (jsDate) =>
    jsDate ? DateTime.fromJSDate(jsDate, { zone }).toFormat("HH:mm") : null;

  return {
    latitude: lat,
    longitude: lon,
    timezone: zone,
    sunriseTime: sunriseDT.toFormat("HH:mm"),
    sunsetTime: sunsetDT.toFormat("HH:mm"),
    sunriseDate: sunriseDT.toJSDate(),
    sunsetDate: sunsetDT.toJSDate(),
    sunriseAzimuth: azRise,
    sunriseDirection: cardinal(azRise),
    sunsetAzimuth: azSet,
    sunsetDirection: cardinal(azSet),
    moon: {
      phaseKey:     vedicKey,
      phaseEmoji:   PHASE_EMOJIS[phaseIdx],
      illumination: Math.round(moonIllum.fraction * 100),
      riseTime:     fmtMoon(moonTimes.rise),
      setTime:      fmtMoon(moonTimes.set),
    },
  };
}
