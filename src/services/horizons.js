// src/services/horizons.js
import axios from "axios";

/**
 * Consulta el valor de longitud eclíptica (grados decimales) de un cuerpo en una fecha.
 * @param {string} id - Horizons ID del objeto (por ejemplo, '10' para el Sol, '301' para la Luna).
 * @param {string} date - Fecha ISO (YYYY-MM-DD).
 * @returns {Promise<number>} - Grados decimales [0–360).
 */
/**
 * Devuelve la longitud eclíptica (°) para el cuerpo JPL `id` en `date`.
 */

export async function fetchEclLon(id, date) {
  const d0 = new Date(date);
  const d1 = new Date(d0);
  d1.setDate(d0.getDate() + 1);
  const stopDate = d1.toISOString().split("T")[0]; // "2025-06-19"
  // 1) Construye la URL exacta que funciona
  const url =
    "https://ssd.jpl.nasa.gov/api/horizons.api" +
    "?format=text" +
    `&COMMAND='${id}'` +
    `&OBJ_DATA='YES'` +
    `&MAKE_EPHEM='YES'` +
    `&EPHEM_TYPE='OBSERVER'` +
    `&CENTER='500@399'` + // <— geocéntrico terrestre
    `&START_TIME='${date}'` +
    `&STOP_TIME='${stopDate}'` +
    `&STEP_SIZE='1%20d'` + // espacio codificado
    `&QUANTITIES='20'`; // longitud eclíptica

  console.log("Horizons URL:", url);
  // 2) Haz la petición en modo texto
  const res = await axios.get(url, { responseType: "text" });
      // 3) Extrae la línea con fecha y hora (YYYY-MMM-DD)
  const line = res.data
    .split("\n")
    .find((l) => /^\s*\d{4}-[A-Za-z]{3}-\d{2}/.test(l));
  if (!line) {
    throw new Error("Horizons no devolvió datos para esa fecha");
  }

  // 4) El tercer campo es la longitud en grados decimales
  const lonDec = parseFloat(line.trim().split(/\s+/)[2]);
  return lonDec;
}

/**
 * Convierte grados decimales a DMS (Degrees, Minutes, Seconds).
 */
export function toDMS(dec) {
  const deg = Math.floor(dec);
  const minF = (dec - deg) * 60;
  const min = Math.floor(minF);
  const sec = Math.round((minF - min) * 60);
  return { deg, min, sec };
}

/**
 * Dado un grado decimal 0–360, devuelve:
 * - signo zodiacal
 * - grado dentro del signo
 * - minutos y segundos
 */
export function toZodiacPosition(dec) {
  const signs = [
    "Aries",
    "Tauro",
    "Géminis",
    "Cáncer",
    "Leo",
    "Virgo",
    "Libra",
    "Escorpio",
    "Sagitario",
    "Capricornio",
    "Acuario",
    "Piscis",
  ];
  const idx = Math.floor(dec / 30);
  const within = dec % 30;
  const { deg, min, sec } = toDMS(within);
  return { sign: signs[idx], deg, min, sec };
}
