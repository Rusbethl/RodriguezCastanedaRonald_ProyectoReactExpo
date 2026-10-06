/**
 * Cliente base para hablar con el backend en Django REST Framework.
 *
 * Todas las peticiones pasan por aquí para que el manejo del token JWT, los
 * encabezados y los errores esté en un solo lugar y no repetido en cada pantalla.
 */
import Constants from 'expo-constants';

// Viene de app.config.js -> extra.apiUrl (que a su vez se lee del archivo .env).
export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8000/api';

let tokenAcceso = null;

/** Lo llamará el AuthProvider después del login para que las peticiones vayan autenticadas. */
export function guardarToken(token) {
  tokenAcceso = token;
}

/**
 * Envía una petición a la API y regresa el JSON de respuesta.
 * Si el servidor responde con error, lanza una excepción con el mensaje de DRF.
 */
export async function peticion(ruta, { metodo = 'GET', datos } = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(tokenAcceso && { Authorization: `Bearer ${tokenAcceso}` }),
    },
    body: datos ? JSON.stringify(datos) : undefined,
  });

  const cuerpo = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new Error(cuerpo?.detail ?? 'Ocurrió un error al conectar con el servidor.');
    error.estado = respuesta.status;
    error.datos = cuerpo;
    throw error;
  }
  return cuerpo;
}
