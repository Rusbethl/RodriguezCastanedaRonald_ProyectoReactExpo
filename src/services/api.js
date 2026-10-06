/**
 * Cliente base para hablar con el backend en Django REST Framework.
 *
 * Todas las peticiones pasan por aquí para que el manejo del token JWT, los
 * encabezados y los errores esté en un solo lugar y no repetido en cada pantalla.
 * Si el token de acceso vence (dura 1 hora), se pide uno nuevo con el refresh
 * token y se repite la petición sin que el usuario lo note.
 */
import Constants from 'expo-constants';

// Viene de app.config.js -> extra.apiUrl (que a su vez se lee del archivo .env).
export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8000/api';

let tokens = { access: null, refresh: null };
// El AuthProvider registra aquí qué hacer cuando se renuevan los tokens (guardarlos)
// y cuando el refresh token también venció (cerrar la sesión).
let avisos = { alRenovar: () => {}, alExpirar: () => {} };

/** Lo llama el AuthProvider al iniciar sesión o al restaurar la sesión guardada. */
export function configurarTokens(nuevos) {
  tokens = { ...tokens, ...nuevos };
}

export function registrarAvisosDeSesion(nuevos) {
  avisos = { ...avisos, ...nuevos };
}

/** Convierte las respuestas de error de DRF en un mensaje legible para mostrar en pantalla. */
function mensajeDeError(cuerpo) {
  if (!cuerpo) return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  if (typeof cuerpo === 'string') return cuerpo;
  if (cuerpo.detail) return cuerpo.detail;
  const primero = Object.values(cuerpo)[0];
  return Array.isArray(primero) ? primero[0] : String(primero);
}

async function renovarToken() {
  if (!tokens.refresh) return false;
  const respuesta = await fetch(`${API_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!respuesta.ok) return false;
  const datos = await respuesta.json();
  tokens = { access: datos.access, refresh: datos.refresh ?? tokens.refresh };
  return tokens;
}

/**
 * Envía una petición a la API y regresa el JSON de respuesta.
 * Si el servidor responde con error, lanza una excepción con el mensaje de DRF
 * en `error.message` y los errores por campo en `error.campos`.
 */
export async function peticion(ruta, { metodo = 'GET', datos, reintento = true } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens.access && { Authorization: `Bearer ${tokens.access}` }),
      },
      body: datos ? JSON.stringify(datos) : undefined,
    });
  } catch {
    const error = new Error('No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
    error.estado = 0;
    throw error;
  }

  if (respuesta.status === 401 && reintento && tokens.refresh) {
    const renovados = await renovarToken();
    if (renovados) {
      avisos.alRenovar(renovados);
      return peticion(ruta, { metodo, datos, reintento: false });
    }
    avisos.alExpirar();
  }

  const cuerpo = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new Error(mensajeDeError(cuerpo));
    error.estado = respuesta.status;
    error.campos = cuerpo && typeof cuerpo === 'object' ? cuerpo : {};
    throw error;
  }
  return cuerpo;
}

export const get = (ruta) => peticion(ruta);
export const post = (ruta, datos) => peticion(ruta, { metodo: 'POST', datos });
export const patch = (ruta, datos) => peticion(ruta, { metodo: 'PATCH', datos });
export const borrar = (ruta) => peticion(ruta, { metodo: 'DELETE' });
