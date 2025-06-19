// src/services/horizons.js
import axios from "axios";

/**
 * @param {string} id        - Código Horizons del cuerpo
 * @param {string} startTime - "YYYY-MMM-DD HH:mm"
 * @param {string} stopTime  - "YYYY-MMM-DD HH:mm"
 * @returns {Promise<number>} longitud eclíptica en grados decimales
 */
export async function fetchEclLon(id, startTime, stopTime) {
  const url =
    "https://ssd.jpl.nasa.gov/api/horizons.api" +
    "?format=text" +
    `&COMMAND='${id}'` +
    `&OBJ_DATA='YES'` +
    `&MAKE_EPHEM='YES'` +
    `&EPHEM_TYPE='OBSERVER'` +
    `&CENTER='500@399'` +
    // un minuto de paso
    `&STEP_SIZE='1%20m'` +
    `&START_TIME='${startTime}'` +
    `&STOP_TIME='${stopTime}'` +
    `&QUANTITIES='31'`;
  console.log("Horizons URL:", url);
  const res = await axios.get(url, { responseType: "text" });
  console.log("Horizons response:", res.data);
  const line = res.data
    .split("\n")
    .find((l) => /^\s*\d{4}-[A-Za-z]{3}-\d{2}/.test(l));

  if (!line) {
    throw new Error("Horizons no devolvió datos para ese rango de fechas");
  }
  return parseFloat(line.trim().split(/\s+/)[2]);
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
