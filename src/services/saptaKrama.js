import { DateTime } from "luxon";

const PLANET_CYCLE = [
  "Sol",
  "Venus",
  "Mercurio",
  "Luna",
  "Saturno",
  "Júpiter",
  "Marte",
];
const DIA_PLANETA = {
  Monday: "Luna",
  Tuesday: "Marte",
  Wednesday: "Mercurio",
  Thursday: "Júpiter",
  Friday: "Venus",
  Saturday: "Saturno",
  Sunday: "Sol",
};

/**
 * Genera la secuencia de muhurtas según day-of-week y duración
 */
export function generarSaptaKrama(sunrise, muhurtaDurMin, diaSemana, timezone) {
  const primerPlaneta = DIA_PLANETA[diaSemana];
  const startIdx = PLANET_CYCLE.indexOf(primerPlaneta);
  const fullCycle = PLANET_CYCLE.slice(startIdx).concat(
    PLANET_CYCLE.slice(0, startIdx)
  );

  const secuencia = [];
  for (let i = 0; i < 12; i++) {
    // instante en ms
    const ts = sunrise.getTime() + muhurtaDurMin * i * 60000;

    // formateamos en la zona deseada:
    const inicio = DateTime.fromMillis(ts, { zone: timezone }).toFormat(
      "HH:mm"
    );

    const fin = DateTime.fromMillis(ts + muhurtaDurMin * 60000, {
      zone: timezone,
    }).toFormat("HH:mm");

    secuencia.push({
      muhurta: i + 1,
      planeta: fullCycle[i % fullCycle.length],
      inicio,
      fin,
    });
  }
  return { primerPlaneta, secuencia };
}
