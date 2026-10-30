/**
 * Catálogo de avisos de FocusSync.
 *
 * Cada tipo define cómo se ve dentro de la app (ícono, color, cuánto tiempo dura) y,
 * si corresponde, por qué canal de Android sale como notificación del sistema.
 * Los tipos sin canal (exito, info, error) solo se muestran dentro de la app.
 */
import * as Notifications from 'expo-notifications';

import { colores } from '../theme';

/**
 * Canales de Android (NotificationChannel). Desde Android 8.0 toda notificación tiene
 * que pertenecer a un canal y el usuario puede configurar cada uno por separado.
 *  - sesiones: es el aviso que el usuario espera con el celular boca abajo, así que
 *    suena y aparece como banner (importancia alta).
 *  - alertas: informa que la sesión tuvo demasiada distracción (importancia alta).
 *  - logros: es una buena noticia pero no urgente; suena y queda en la bandeja sin
 *    interrumpir con banner (importancia normal).
 */
export const CANALES = {
  sesiones: {
    id: 'focussync-sesiones',
    nombre: 'Sesiones de estudio',
    importancia: Notifications.AndroidImportance.HIGH,
    vibracion: [0, 400, 200, 400],
  },
  alertas: {
    id: 'focussync-alertas',
    nombre: 'Alertas de distracción',
    importancia: Notifications.AndroidImportance.HIGH,
    vibracion: [0, 200, 100, 200],
  },
  logros: {
    id: 'focussync-logros',
    nombre: 'Logros y rachas',
    importancia: Notifications.AndroidImportance.DEFAULT,
    vibracion: [0, 200],
  },
};

/**
 * icono    nombre de Feather
 * color    color del ícono y del borde del aviso
 * duracion milisegundos que se ve dentro de la app
 * canal    clave de CANALES; sin canal, el aviso no sale al sistema
 */
export const TIPOS = {
  sesion: { icono: 'clock', color: colores.verde, duracion: 6000, canal: 'sesiones' },
  alerta: { icono: 'alert-triangle', color: colores.coral, duracion: 6000, canal: 'alertas' },
  logro: { icono: 'award', color: '#C9A227', duracion: 5000, canal: 'logros' },
  exito: { icono: 'check-circle', color: colores.verde, duracion: 3500, canal: null },
  info: { icono: 'info', color: '#3A7CA5', duracion: 3500, canal: null },
  error: { icono: 'x-circle', color: colores.coral, duracion: 4500, canal: null },
};
