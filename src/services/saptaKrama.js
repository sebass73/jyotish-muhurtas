import { format } from "date-fns";

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
export function generarSaptaKrama(sunrise, muhurtaDurMin, diaSemana) {
  const primerPlaneta = DIA_PLANETA[diaSemana];
  const startIdx = PLANET_CYCLE.indexOf(primerPlaneta);
  const fullCycle = PLANET_CYCLE.slice(startIdx).concat(
    PLANET_CYCLE.slice(0, startIdx)
  );

  const secuencia = [];
  for (let i = 0; i < 12; i++) {
    const inicio = new Date(sunrise.getTime() + muhurtaDurMin * i * 60000);
    const fin = new Date(inicio.getTime() + muhurtaDurMin * 60000);
    secuencia.push({
      muhurta: i + 1,
      planeta: fullCycle[i % fullCycle.length],
      inicio: format(inicio, "HH:mm"),
      fin: format(fin, "HH:mm"),
    });
  }

  return { primerPlaneta, secuencia };
}
