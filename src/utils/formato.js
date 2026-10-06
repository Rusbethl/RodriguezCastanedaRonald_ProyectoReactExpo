/**
 * Funciones pequeñas de formato que usan varias pantallas (Inicio, Historial,
 * Análisis). Están aquí para que el mismo dato se muestre igual en toda la app.
 */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** 80 -> "1h 20m", 45 -> "45 min" */
export function formatearMinutos(minutos = 0) {
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);
  if (!horas) return `${resto} min`;
  return resto ? `${horas}h ${resto}m` : `${horas} h`;
}

/** Porcentaje del tiempo de estudio que se fue en el celular. */
export function porcentajePantalla(minutosEstudio, minutosPantalla) {
  if (!minutosEstudio) return 0;
  return Math.round((Math.min(minutosPantalla, minutosEstudio) * 100) / minutosEstudio);
}

/** "2026-10-05" (fecha sin hora de la API) -> Date local, sin desfase por zona horaria. */
export function fechaLocal(texto) {
  const [a, m, d] = texto.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Date -> "2026-10-05" para mandarlo a la API */
export function aISO(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${m}-${d}`;
}

/** "Lunes 5 de octubre" */
export function fechaLarga(fecha) {
  const f = typeof fecha === 'string' ? fechaLocal(fecha) : fecha;
  const dia = DIAS[f.getDay()];
  return `${dia[0].toUpperCase()}${dia.slice(1)} ${f.getDate()} de ${MESES[f.getMonth()]}`;
}

/** "5 oct" */
export function fechaCorta(fecha) {
  const f = typeof fecha === 'string' ? fechaLocal(fecha) : fecha;
  return `${f.getDate()} ${MESES[f.getMonth()].slice(0, 3)}`;
}

/** Hora "20:30" de un datetime ISO de la API */
export function hora(iso) {
  const f = new Date(iso);
  return `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
}

/** Agrupa sesiones por día: "HOY", "AYER" o "LUNES 28 SEP" */
export function etiquetaDia(iso) {
  const f = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (f.toDateString() === hoy.toDateString()) return 'HOY';
  if (f.toDateString() === ayer.toDateString()) return 'AYER';
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()].slice(0, 3)}`.toUpperCase();
}

/** 1574 segundos -> "26:14" */
export function reloj(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${m}:${r}` : `${m}:${r}`;
}
