/**
 * Notificaciones del sistema (las de la barra de notificaciones del celular).
 *
 * Todo el uso de expo-notifications está en este archivo: las pantallas nunca lo
 * llaman directamente, pasan por useNotificaciones(). Así, si un día se cambia la
 * librería, solo se modifica aquí.
 *
 * En web no existe expo-notifications; se usa la API Notification del navegador y
 * setTimeout para las programadas.
 *
 * Todas las funciones fallan en silencio (regresan null o false): si no hay permiso o
 * el dispositivo no las soporta, la app sigue funcionando.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colores } from '../theme';
import { CANALES, TIPOS } from './tipos';

const ES_WEB = Platform.OS === 'web';
const programadasWeb = new Map(); // id -> temporizador

/**
 * Se llama una sola vez al arrancar. Define cómo se muestra una notificación que llega
 * con la app abierta y crea los canales de Android.
 *
 * El banner del sistema se oculta si la app está en primer plano, porque en ese caso ya
 * se muestra el aviso propio dentro de la app y saldría repetido. La notificación sí
 * queda en la bandeja del celular.
 */
export async function configurarSistema() {
  if (ES_WEB) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    for (const canal of Object.values(CANALES)) {
      await Notifications.setNotificationChannelAsync(canal.id, {
        name: canal.nombre,
        importance: canal.importancia,
        vibrationPattern: canal.vibracion,
        lightColor: colores.verde,
      });
    }
  }
}

/** Indica si el sistema ya dio permiso para mostrar notificaciones. */
export async function permisoSistema() {
  try {
    if (ES_WEB) return typeof Notification !== 'undefined' && Notification.permission === 'granted';
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Pide el permiso. En Android 13 o superior el sistema no muestra la ventana si todavía
 * no existe ningún canal, por eso configurarSistema() se ejecuta antes.
 */
export async function pedirPermisoSistema() {
  try {
    if (ES_WEB) {
      if (typeof Notification === 'undefined') return false;
      if (Notification.permission === 'granted') return true;
      return (await Notification.requestPermission()) === 'granted';
    }
    const actual = await Notifications.getPermissionsAsync();
    if (actual.status === 'granted') return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.status === 'granted';
  } catch {
    return false;
  }
}

function contenido({ tipo, titulo, mensaje, datos }) {
  return { title: titulo, body: mensaje ?? '', data: { tipo, ...datos }, color: colores.verde };
}

function mostrarWeb({ tipo, titulo, mensaje }) {
  const canal = CANALES[TIPOS[tipo]?.canal];
  // eslint-disable-next-line no-console
  console.log('NOTIF_SISTEMA', titulo, '|', mensaje ?? '', '| canal=' + (canal?.id ?? '—'));
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(titulo, { body: mensaje ?? '' }); // eslint-disable-line no-new
  }
}

/**
 * Muestra una notificación del sistema ahora mismo.
 * Regresa su id o null si no se pudo.
 */
export async function mostrarSistema(opciones) {
  try {
    const canal = CANALES[TIPOS[opciones.tipo]?.canal];
    if (!canal) return null;
    if (ES_WEB) {
      mostrarWeb(opciones);
      return `web-${Date.now()}`;
    }
    return await Notifications.scheduleNotificationAsync({
      content: contenido(opciones),
      trigger: Platform.OS === 'android' ? { channelId: canal.id } : null,
    });
  } catch {
    return null;
  }
}

/**
 * Programa una notificación para dentro de 'enSegundos'. En el celular la programa el
 * sistema operativo (llega aunque la app se cierre); en web usa setTimeout.
 * Regresa su id para poder cancelarla.
 */
export async function programarSistema({ enSegundos, ...opciones }) {
  try {
    const canal = CANALES[TIPOS[opciones.tipo]?.canal];
    if (!canal || !(enSegundos > 0)) return null;
    if (ES_WEB) {
      const id = `web-${Date.now()}`;
      // eslint-disable-next-line no-console
      console.log('PROGRAMADA_EN_MS', Math.round(enSegundos * 1000));
      programadasWeb.set(id, setTimeout(() => {
        programadasWeb.delete(id);
        mostrarWeb(opciones);
      }, enSegundos * 1000));
      return id;
    }
    return await Notifications.scheduleNotificationAsync({
      content: contenido(opciones),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(enSegundos)),
        channelId: Platform.OS === 'android' ? canal.id : undefined,
      },
    });
  } catch {
    return null;
  }
}

/** Cancela una notificación programada que todavía no se muestra. */
export async function cancelarSistema(id) {
  if (!id) return;
  try {
    if (ES_WEB) {
      clearTimeout(programadasWeb.get(id));
      programadasWeb.delete(id);
    } else {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch {
    // si ya se mostró o no existe, no pasa nada
  }
}

/** Cancela todas las programadas (se usa al cerrar sesión). */
export async function cancelarTodasSistema() {
  try {
    if (ES_WEB) {
      programadasWeb.forEach((t) => clearTimeout(t));
      programadasWeb.clear();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch {
    // nada que cancelar
  }
}
