/**
 * Carpeta 'services': centraliza las llamadas a la API para mantener los
 * componentes y pantallas limpios. Una pantalla nunca usa fetch directamente;
 * pide los datos a un servicio (auth, sesiones, materias, metas...).
 */
export { API_URL, guardarToken, peticion } from './api';
