/**
 * Funciones para cada recurso de la API, agrupadas por pantalla.
 * Las pantallas llaman, por ejemplo, sesiones.finalizar(id, datos) y no tienen que
 * saber la URL exacta ni el método HTTP.
 */
import { borrar, get, patch, post } from './api';

export const auth = {
  login: (email, password) => post('/auth/login/', { email, password }),
  registro: (datos) => post('/auth/registro/', datos),
  yo: () => get('/auth/yo/'),
  recuperar: (email) => post('/auth/recuperar/', { email }),
};

export const perfil = {
  obtener: () => get('/perfil/'),
  actualizar: (datos) => patch('/perfil/', datos),
};

export const configuracion = {
  obtener: () => get('/configuracion/'),
  actualizar: (datos) => patch('/configuracion/', datos),
};

export const dispositivos = {
  listar: () => get('/dispositivos/'),
  crear: (datos) => post('/dispositivos/', datos),
  eliminar: (id) => borrar(`/dispositivos/${id}/`),
};

export const inicio = { resumen: () => get('/inicio/') };

export const materias = {
  listar: (archivada = false) => get(`/materias/?archivada=${archivada}`),
  crear: (datos) => post('/materias/', datos),
  actualizar: (id, datos) => patch(`/materias/${id}/`, datos),
  eliminar: (id) => borrar(`/materias/${id}/`),
};

export const catalogos = {
  nivelesEnfoque: () => get('/niveles-enfoque/'),
  appsDistractoras: () => get('/apps-distractoras/'),
};

export const sesiones = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v != null && v !== ''));
    return get(`/sesiones/?${params}`);
  },
  siguientePagina: (url) => get(url.slice(url.indexOf('/sesiones/'))),
  iniciar: (materia) => post('/sesiones/', { materia }),
  activa: () => get('/sesiones/activa/'),
  obtener: (id) => get(`/sesiones/${id}/`),
  finalizar: (id, datos) => post(`/sesiones/${id}/finalizar/`, datos),
  eliminar: (id) => borrar(`/sesiones/${id}/`),
};

export const reportes = { semanal: (fecha) => get(`/reportes/semanal/${fecha ? `?fecha=${fecha}` : ''}`) };

export const metas = {
  listar: () => get('/metas/?activas=true'),
  crear: (datos) => post('/metas/', datos),
  eliminar: (id) => borrar(`/metas/${id}/`),
};

export const notificaciones = {
  listar: (soloNoLeidas) => get(`/notificaciones/${soloNoLeidas ? '?leido=false' : ''}`),
  marcarLeida: (id) => post(`/notificaciones/${id}/marcar-leida/`),
  marcarTodas: () => post('/notificaciones/marcar-todas/'),
};

export const alertas = {
  listar: () => get('/alertas/'),
  actualizar: (id, datos) => patch(`/alertas/${id}/`, datos),
};

export const logros = { listar: () => get('/logros/'), racha: () => get('/racha/') };
