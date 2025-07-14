import { obtenerDatosSol } from "./sunCalc";
import { generarSaptaKrama, PLANET_CYCLE } from "./saptaKrama";
import { differenceInMinutes } from "date-fns";
import { DateTime } from "luxon";

export async function ejecutarJSON(ciudad, pais, fechaISO) {
  (ciudad = ciudad), (pais = pais), (fechaISO = fechaISO);

  // 1) Datos del Sol (localización, sunrise/sunset, azimut y cardinales)
  const {
    latitude,
    longitude,
    timezone,
    sunriseDate,
    sunsetDate,
    sunriseAzimuth,
    sunriseDirection,
    sunsetAzimuth,
    sunsetDirection,
  } = await obtenerDatosSol(ciudad, pais, fechaISO);

  // 2) Día de la semana: a partir de la CADENA fechaISO en la zona local
  const fechaDT = DateTime.fromISO(fechaISO, { zone: timezone }).setLocale(
    "en"
  );
  const diaSemana = fechaDT.toFormat("cccc");
  const arcoMin = differenceInMinutes(sunsetDate, sunriseDate);
  const muhurtaDia = Math.round(arcoMin / 12);
  const muhurtaNoche = Math.round((1440 - arcoMin) / 12);
  
  // 3) Cálculo de arco solar y muhûrtas
  // ——— daytime muhurtas ———
  const { primerPlaneta, secuencia: saptaKramaDia } = generarSaptaKrama(
    sunriseDate,
    arcoMin / 12,
    timezone,
    { diaSemana }
  );

  // ——— nighttime muhurtas ———
  // startPlanet = next after last daytime planet
  const lastDayPlanet = saptaKramaDia[11].planeta;
  const nextStartPlanet =
    PLANET_CYCLE[
      (PLANET_CYCLE.indexOf(lastDayPlanet) + 1) % PLANET_CYCLE.length
    ];
  const { secuencia: saptaKramaNoche } = generarSaptaKrama(
    sunsetDate,
    muhurtaNoche,
    timezone,
    { startPlanet: nextStartPlanet }
  );

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
