/**
 * Sistema de avisos de FocusSync.
 *
 * Tres partes que trabajan juntas:
 *  1. Avisos dentro de la app (componente Aviso): una tarjeta que baja desde arriba unos
 *     segundos. Funciona en Android, iOS y web.
 *  2. Notificaciones del sistema (sistema.js): las de la barra de notificaciones.
 *  3. Bandeja del servidor: la pantalla Notificaciones (GET /api/notificaciones/).
 *
 * Las pantallas nunca usan expo-notifications directamente; todas usan el hook
 * useNotificaciones(), que decide si el aviso va solo dentro de la app o también al
 * sistema, en qué canal, con qué ícono y color, y si el usuario las tiene activadas.
 *
 *   avisar(opciones)    aviso dentro de la app
 *   notificar(opciones) aviso en la app + notificación del sistema (si hay canal y permiso)
 *   programar(opciones) notificación del sistema para dentro de 'enSegundos'
 *   cancelar(id) / cancelarTodas()
 *   activas / setActivas   preferencia "Notificaciones activas" de Configuración
 *   permiso / pedirPermiso()
 */
import { Feather } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context';
import { configuracion } from '../services';
import { colores, fuentes } from '../theme';
import {
  cancelarSistema,
  cancelarTodasSistema,
  configurarSistema,
  mostrarSistema,
  pedirPermisoSistema,
  permisoSistema,
  programarSistema,
} from './sistema';
import { TIPOS } from './tipos';

const Contexto = createContext(null);
let contador = 0;

export function NotificacionesProvider({ children }) {
  const { usuario } = useAuth();
  const [activas, setActivas] = useState(true);
  const [permiso, setPermiso] = useState(false);
  const [aviso, setAviso] = useState(null);
  const cola = useRef([]);
  const mostrando = useRef(false);
  const temporizador = useRef(null);

  // Primero se crean los canales y después se pide el permiso
  useEffect(() => {
    (async () => {
      await configurarSistema();
      setPermiso(await permisoSistema());
    })();
  }, []);

  // La preferencia del usuario vive en el servidor: se lee al iniciar sesión
  useEffect(() => {
    if (!usuario) return;
    configuracion.obtener().then((c) => setActivas(c.notificaciones_activas)).catch(() => {});
  }, [usuario]);

  const siguiente = useCallback(() => {
    const proximo = cola.current.shift();
    if (!proximo) {
      mostrando.current = false;
      setAviso(null);
      return;
    }
    mostrando.current = true;
    setAviso(proximo);
    temporizador.current = setTimeout(siguiente, proximo.duracion + 350);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const avisar = useCallback(
    ({ tipo = 'info', titulo, mensaje, duracion }) => {
      const config = TIPOS[tipo] ?? TIPOS.info;
      const id = ++contador;
      cola.current.push({ id, tipo, titulo, mensaje, duracion: duracion ?? config.duracion });
      if (!mostrando.current) siguiente();
      return id;
    },
    [siguiente],
  );

  const pedirPermiso = useCallback(async () => {
    const ok = await pedirPermisoSistema();
    setPermiso(ok);
    return ok;
  }, []);

  const puedeNotificar = useCallback(
    async (tipo) => {
      if (!TIPOS[tipo]?.canal || !activas) return false;
      return permiso || (await pedirPermiso());
    },
    [activas, permiso, pedirPermiso],
  );

  const notificar = useCallback(
    async (opciones) => {
      avisar(opciones);
      if (!(await puedeNotificar(opciones.tipo))) return null;
      return mostrarSistema(opciones);
    },
    [avisar, puedeNotificar],
  );

  const programar = useCallback(
    async (opciones) => {
      if (!(await puedeNotificar(opciones.tipo))) return null;
      return programarSistema(opciones);
    },
    [puedeNotificar],
  );

  const valor = useMemo(
    () => ({
      avisar,
      notificar,
      programar,
      cancelar: cancelarSistema,
      cancelarTodas: cancelarTodasSistema,
      activas,
      setActivas,
      permiso,
      pedirPermiso,
    }),
    [avisar, notificar, programar, activas, permiso, pedirPermiso],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {aviso && <Aviso key={aviso.id} {...aviso} />}
    </Contexto.Provider>
  );
}

/** Hook para usar el sistema desde cualquier pantalla: const { avisar } = useNotificaciones(); */
export function useNotificaciones() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useNotificaciones debe usarse dentro de <NotificacionesProvider>.');
  return contexto;
}

/** Tarjeta que baja desde arriba, se queda 'duracion' ms y vuelve a subir. */
function Aviso({ tipo, titulo, mensaje, duracion }) {
  const { top } = useSafeAreaInsets();
  const config = TIPOS[tipo] ?? TIPOS.info;
  const posicion = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(posicion, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.delay(duracion),
      Animated.timing(posicion, { toValue: -140, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [posicion, duracion]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[estilos.contenedor, { top: top + 8, transform: [{ translateY: posicion }] }]}
    >
      <View style={[estilos.tarjeta, { borderLeftColor: config.color }]}>
        <Feather name={config.icono} size={22} color={config.color} />
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {!!mensaje && <Text style={estilos.mensaje}>{mensaje}</Text>}
        </View>
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'absolute', left: 14, right: 14, alignItems: 'center', zIndex: 1000 },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 520,
    backgroundColor: colores.blanco,
    borderRadius: 16,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 14.5, color: colores.texto },
  mensaje: { fontFamily: fuentes.regular, fontSize: 12.5, lineHeight: 17, color: colores.textoSecundario, marginTop: 1 },
});
