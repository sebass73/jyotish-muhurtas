import { obtenerDatosSol } from "./sunCalc";
import { generarSaptaKrama } from "./saptaKrama";
import { differenceInMinutes } from "date-fns";
import { DateTime } from "luxon";

export async function ejecutarJSON(ciudad, pais, fechaISO) {
  (ciudad = ciudad), (pais = pais), (fechaISO = fechaISO);

  console.log(
    `Ejecutando con ciudad: ${ciudad}, país: ${pais}, fecha: ${fechaISO}`
  );
  // 1) Datos del Sol (localización, sunrise/sunset, azimut y cardinales)
  const {
    latitude,
    longitude,
    timezone,
    // sunriseTime,
    // sunsetTime,
    sunriseDate,
    sunsetDate,
    sunriseAzimuth,
    sunriseDirection,
    sunsetAzimuth,
    sunsetDirection,
  } = await obtenerDatosSol(ciudad, pais, fechaISO);

  // 3) Día de la semana: a partir de la CADENA fechaISO en la zona local
  const fechaDT = DateTime.fromISO(fechaISO, { zone: timezone }).setLocale(
    "en"
  ); // ó el locale que quieras
  const diaSemana = fechaDT.toFormat("cccc");
  console.log(`Día de la semana: ${diaSemana}`);

  // 2) Cálculo de arco solar y muhûrtas
  const arcoMin = differenceInMinutes(sunsetDate, sunriseDate);
  const muhurtaDia = Math.round(arcoMin / 12);
  const muhurtaNoche = Math.round((1440 - arcoMin) / 12);
  const { primerPlaneta, secuencia: saptaKramaDia } = generarSaptaKrama(
    sunriseDate,
    arcoMin / 12,
    diaSemana,
    timezone
  );

  // ——— Generar los 12 muhurtas de la noche ———
  const saptaKramaNoche = [];
  for (let i = 0; i < 12; i++) {
    const tStart = sunsetDate.getTime() + i * muhurtaNoche * 60000;
    const tEnd = tStart + muhurtaNoche * 60000;
    saptaKramaNoche.push({
      muhurta: i + 1,
      inicio: DateTime.fromMillis(tStart, { zone: timezone }).toFormat("HH:mm"),
      fin: DateTime.fromMillis(tEnd, { zone: timezone }).toFormat("HH:mm"),
    });
  }

  // 3) Construcción del JSON de salida
  return {
    ciudad,
    pais,
    fecha: fechaISO,
    latitude,
    longitude,
    timezone,
    diaSemana,
    sunrise: {
      time: DateTime.fromJSDate(sunriseDate, { zone: timezone }).toFormat(
        "HH:mm"
      ),
      azimuth: Math.round(sunriseAzimuth * 10) / 10,
      direction: sunriseDirection,
    },
    sunset: {
      time: DateTime.fromJSDate(sunsetDate, { zone: timezone }).toFormat(
        "HH:mm"
      ),
      azimuth: Math.round(sunsetAzimuth * 10) / 10,
      direction: sunsetDirection,
    },
    arcoSol: arcoMin,
    muhurtaDia,
    muhurtaNoche,
    primerPlaneta,
    saptaKramaDia,
    saptaKramaNoche,
  };
}

export default { ejecutarJSON };
