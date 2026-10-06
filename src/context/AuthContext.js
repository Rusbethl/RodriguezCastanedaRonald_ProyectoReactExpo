/**
 * Contexto de autenticación.
 *
 * Guarda quién es el usuario y sus tokens para que cualquier pantalla sepa si hay
 * sesión iniciada. Al abrir la app intenta restaurar la sesión guardada en el
 * celular, así el usuario no tiene que escribir su contraseña cada vez.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { almacenamiento, auth, configurarTokens, registrarAvisosDeSesion } from '../services';

const AuthContext = createContext(null);
const CLAVE_ACCESS = 'focussync_access';
const CLAVE_REFRESH = 'focussync_refresh';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  // true justo después de registrarse, para llevar al usuario a completar su perfil (paso 2)
  const [esNuevo, setEsNuevo] = useState(false);

  const guardarTokens = useCallback(async ({ access, refresh }) => {
    configurarTokens({ access, refresh });
    await almacenamiento.guardar(CLAVE_ACCESS, access);
    await almacenamiento.guardar(CLAVE_REFRESH, refresh);
  }, []);

  const cerrarSesion = useCallback(async () => {
    configurarTokens({ access: null, refresh: null });
    await almacenamiento.guardar(CLAVE_ACCESS, null);
    await almacenamiento.guardar(CLAVE_REFRESH, null);
    setUsuario(null);
  }, []);

  // Restaurar la sesión guardada al abrir la app
  useEffect(() => {
    registrarAvisosDeSesion({ alRenovar: guardarTokens, alExpirar: cerrarSesion });
    (async () => {
      try {
        const access = await almacenamiento.leer(CLAVE_ACCESS);
        const refresh = await almacenamiento.leer(CLAVE_REFRESH);
        if (refresh) {
          configurarTokens({ access, refresh });
          setUsuario(await auth.yo());
        }
      } catch {
        await cerrarSesion();
      } finally {
        setCargando(false);
      }
    })();
  }, [guardarTokens, cerrarSesion]);

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      esNuevo,
      iniciarSesion: async (email, password) => {
        const datos = await auth.login(email, password);
        await guardarTokens(datos);
        setEsNuevo(false);
        setUsuario(datos.usuario);
      },
      registrarse: async (datosRegistro) => {
        const datos = await auth.registro(datosRegistro);
        await guardarTokens(datos);
        setEsNuevo(true);
        setUsuario(datos.usuario);
      },
      terminarRegistro: () => setEsNuevo(false),
      recargarUsuario: async () => setUsuario(await auth.yo()),
      cerrarSesion,
    }),
    [usuario, cargando, esNuevo, guardarTokens, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/** Hook para leer la sesión desde cualquier pantalla: const { usuario } = useAuth(); */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
}
