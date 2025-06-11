import { obtenerDatosSol } from "./sunCalc";
import { generarSaptaKrama } from "./saptaKrama";
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

export async function ejecutarJSON(
  ciudad = "Paola",
  pais = "Italia",
  fechaISO = new Date().toISOString().split("T")[0]
) {
  if (!isValid(parseISO(fechaISO))) {
    throw new Error("Fecha inválida. Usa el formato YYYY-MM-DD");
  }
  const { latitude, longitude, timezone, sunriseLocal, sunsetLocal } =
    await obtenerDatosSol(ciudad, pais, fechaISO);
  const diaSemana = format(sunriseLocal, "EEEE", { timeZone: timezone });
  const arcoSol = differenceInMinutes(sunsetLocal, sunriseLocal);
  const muhurtaDia = Math.round(arcoSol / 12);
  const muhurtaNoche = Math.round((1440 - arcoSol) / 12);
  const { primerPlaneta, secuencia } = generarSaptaKrama(
    sunriseLocal,
    arcoSol / 12,
    diaSemana
  );
  return {
    ciudad,
    pais,
    fecha: fechaISO,
    diaSemana,
    sunrise: format(sunriseLocal, "HH:mm"),
    sunset: format(sunsetLocal, "HH:mm"),
    arcoSol,
    muhurtaDia,
    muhurtaNoche,
    primerPlaneta,
    latitude,
    longitude,
    saptaKrama: secuencia,
  };
}

export default { ejecutar, ejecutarJSON };
