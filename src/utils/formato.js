/**
 * Funciones pequeñas de formato que usan varias pantallas (Inicio, Historial,
 * Análisis). Están aquí para que el mismo dato se muestre igual en toda la app.
 */

/** 80 -> "1h 20m", 45 -> "45 min" */
export function formatearMinutos(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto} min`;
  return resto ? `${horas}h ${resto}m` : `${horas} h`;
}

/** Porcentaje del tiempo de estudio que se fue en el celular. */
export function porcentajePantalla(minutosEstudio, minutosPantalla) {
  if (!minutosEstudio) return 0;
  return Math.round((Math.min(minutosPantalla, minutosEstudio) * 100) / minutosEstudio);
}
