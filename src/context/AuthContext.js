/**
 * Contexto de autenticación.
 *
 * Guarda quién es el usuario y su token para que cualquier pantalla pueda saber
 * si hay sesión iniciada. Por ahora solo define la estructura; el login real
 * contra /api/auth/login/ se conectará en la siguiente entrega.
 */
import { createContext, useContext, useMemo, useState } from 'react';

import { guardarToken } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const valor = useMemo(
    () => ({
      usuario,
      haySesion: Boolean(usuario),
      iniciarSesion: (datosUsuario, token) => {
        guardarToken(token);
        setUsuario(datosUsuario);
      },
      cerrarSesion: () => {
        guardarToken(null);
        setUsuario(null);
      },
    }),
    [usuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/** Hook para leer la sesión desde cualquier pantalla: const { usuario } = useAuth(); */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
}
