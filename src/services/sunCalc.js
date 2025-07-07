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
  });
  const lat = parseFloat(geo.data[0].lat);
  const lon = parseFloat(geo.data[0].lon);
  const zone = tzlookup(lat, lon);

  // 2) Calcular amanecer/atardecer
  const d = DateTime.fromISO(fechaISO, { zone }).toJSDate();
  const times = SunCalc.getTimes(d, lat, lon);

  // 3) Posición y azimut
  const sunriseDT = DateTime.fromJSDate(times.sunrise, { zone });
  const sunsetDT = DateTime.fromJSDate(times.sunset, { zone });
  const risePos = SunCalc.getPosition(times.sunrise, lat, lon);
  const setPos = SunCalc.getPosition(times.sunset, lat, lon);
  const toDeg = (r) => ((r * 180) / Math.PI + 180) % 360;
  const azRise = toDeg(risePos.azimuth);
  const azSet = toDeg(setPos.azimuth);
  // 4) Punto cardinal
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const cardinal = (deg) => dirs[Math.round(deg / 45) % 8];

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
  };
}
