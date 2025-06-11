// const { obtenerDatosSol } = require("./sunCalc");
import { obtenerDatosSol } from "./sunCalc";
// const { generarSaptaKrama } = require("./saptaKrama");
import { generarSaptaKrama } from "./saptaKrama";
// const { mostrarSalida } = require("../utils/formatter");
import { mostrarSalida } from "../utils/formatter";
// const { format, differenceInMinutes, isValid, parseISO } = require("date-fns");
import { format, differenceInMinutes, isValid, parseISO } from "date-fns";

async function ejecutar(
  ciudad = "Paola",
  pais = "Italia",
  fechaISO = new Date().toISOString().split("T")[0]
) {
  try {
    if (!isValid(parseISO(fechaISO))) {
      throw new Error("Fecha inválida. Usa el formato YYYY-MM-DD");
    }

    const { timezone, sunriseLocal, sunsetLocal } = await obtenerDatosSol(
      ciudad,
      pais,
      fechaISO
    );
    const diaSemana = format(sunriseLocal, "EEEE", { timeZone: timezone });
    const arcoSol = differenceInMinutes(sunsetLocal, sunriseLocal);
    const muhurtaDia = arcoSol / 12;
    const muhurtaNoche = (1440 - arcoSol) / 12;

    const { primerPlaneta, secuencia } = generarSaptaKrama(
      sunriseLocal,
      muhurtaDia,
      diaSemana
    );

    return mostrarSalida(
      ciudad,
      pais,
      fechaISO,
      diaSemana,
      sunriseLocal,
      sunsetLocal,
      arcoSol,
      muhurtaDia,
      muhurtaNoche,
      primerPlaneta,
      secuencia
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Ejecutar si se llama directamente
// if (require.main === module) {
//   const args = process.argv.slice(2);
//   const [ciudad, pais, fecha] = args;
//   ejecutar(ciudad, pais, fecha);
// }

// src/main.js
// … (preserva todo lo anterior)
// const { format: fmt } = require("date-fns");

export async function ejecutarJSON(
  ciudad = "Paola",
  pais = "Italia",
  fechaISO = new Date().toISOString().split("T")[0]
) {
  console.log("Ejecutando con parámetros:");
  if (!isValid(parseISO(fechaISO))) {
    throw new Error("Fecha inválida. Usa el formato YYYY-MM-DD");
  }
  console.log("Ejecutando con parámetros4:");
  const { latitude, longitude, timezone, sunriseLocal, sunsetLocal } =
    await obtenerDatosSol(ciudad, pais, fechaISO);
  console.log("Ejecutando con parámetros3:");
  const diaSemana = format(sunriseLocal, "EEEE", { timeZone: timezone });
  const arcoSol = differenceInMinutes(sunsetLocal, sunriseLocal);
  const muhurtaDia = Math.round(arcoSol / 12);
  const muhurtaNoche = Math.round((1440 - arcoSol) / 12);
  const { primerPlaneta, secuencia } = generarSaptaKrama(
    sunriseLocal,
    arcoSol / 12,
    diaSemana
  );
  console.log("Ejecutando con parámetros2:");
  return {
    ciudad,
    pais,
    fecha: fechaISO,
    diaSemana,
    amanecer: format(sunriseLocal, "HH:mm"),
    atardecer: format(sunsetLocal, "HH:mm"),
    arcoSol,
    muhurtaDia,
    muhurtaNoche,
    primerPlaneta,
    latitude,
    longitude,
    saptaKrama: secuencia,
  };
}

// module.exports = { ejecutar, ejecutarJSON };

// module.exports = { ejecutar };
export default { ejecutar, ejecutarJSON };
