import { format } from "date-fns";

export function mostrarSalida(
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
) {

  const salida = [];
  salida.push(`📍 Localización: ${ciudad}, ${pais}`);
  salida.push(`📆 Fecha: ${fechaISO}`);
  salida.push(`🗓 Día: ${diaSemana}`);
  salida.push(`🌅 Amanecer: ${format(sunriseLocal, "HH:mm")}`);
  salida.push(`🌇 Atardecer: ${format(sunsetLocal, "HH:mm")}`);
  salida.push(`☀️ Arco del Sol: ${arcoSol} minutos`);
  salida.push(`🕒 Muhurta del Día: ${muhurtaDia.toFixed(2)} minutos`);
  salida.push(`🌙 Muhurta de la Noche: ${muhurtaNoche.toFixed(2)} minutos`);

  salida.push(`\n🧘 Sapta Krama del día (${primerPlaneta}):`);
  secuencia.forEach(({ muhurta, inicio, fin, planeta }) => {
    salida.push(`  ${muhurta}. ${inicio} → ${fin} → ${planeta}`);
  });

  return salida.join("\n");
}
