import axios from "axios";
import tzlookup from "tz-lookup";
import { parseISO } from "date-fns";

/**
 * Geocodifica y obtiene sunrise/sunset en hora local
 */
export async function obtenerDatosSol(ciudad, pais, fechaISO) {
  // 1) Geocoding con Nominatim
  const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: `${ciudad}, ${pais}`, format: "json", limit: 1 },
    headers: { "User-Agent": "JyotishYogaApp/1.0" },
  });
  if (!geoRes.data?.length) throw new Error("No se encontró la localización");
  const latitude = parseFloat(geoRes.data[0].lat);
  const longitude = parseFloat(geoRes.data[0].lon);
  const timezone = tzlookup(latitude, longitude);

  // 2) Sunrise-Sunset API
  const sunRes = await axios.get("https://api.sunrise-sunset.org/json", {
    params: { lat: latitude, lng: longitude, date: fechaISO, formatted: 0 },
  });
  const results = sunRes.data?.results;
  if (!results?.sunrise || !results?.sunset)
    throw new Error("No se obtuvieron amanecer/atardecer");

  // Parse UTC times
  const sunriseUTC = parseISO(results.sunrise);
  const sunsetUTC = parseISO(results.sunset);

  // Convertir a zona local
  const sunriseLocal = new Date(
    sunriseUTC.toLocaleString("en-US", { timeZone: timezone })
  );
  const sunsetLocal = new Date(
    sunsetUTC.toLocaleString("en-US", { timeZone: timezone })
  );

  return { latitude, longitude, timezone, sunriseLocal, sunsetLocal };
}
