import { DateTime } from "luxon";

export const PLANET_CYCLE = [
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
 * @param startTime    Date   – moment to start dividing (sunrise or sunset)
 * @param muhurtaDur   number – length of each muhurta in minutes
 * @param timezone     string – IANA zone, e.g. "Europe/Rome"
 * @param opts         { diaSemana?: string, startPlanet?: string }
 *                      – one of diaSemana (for daytime) or startPlanet (for nighttime)
 */
export function generarSaptaKrama(
  startTime,
  muhurtaDurMin,
  timezone,
  opts = {}
) {
  // decide the very first planet:
  const primerPlaneta = opts.startPlanet
    ? opts.startPlanet
    : DIA_PLANETA[opts.diaSemana];

  // rotate the cycle so it begins at primerPlaneta
  const startIdx = PLANET_CYCLE.indexOf(primerPlaneta);
  const fullCycle = PLANET_CYCLE.slice(startIdx).concat(
    PLANET_CYCLE.slice(0, startIdx)
  );

  const secuencia = [];
  for (let i = 0; i < 12; i++) {
    const ts = startTime.getTime() + muhurtaDurMin * i * 60000;
    secuencia.push({
      muhurta: i + 1,
      planeta: fullCycle[i % fullCycle.length],
      inicio: DateTime.fromMillis(ts, { zone: timezone }).toFormat("HH:mm"),
      fin: DateTime.fromMillis(ts + muhurtaDurMin * 60000, {
        zone: timezone,
      }).toFormat("HH:mm"),
    });
  }

  return { primerPlaneta, secuencia };
}
