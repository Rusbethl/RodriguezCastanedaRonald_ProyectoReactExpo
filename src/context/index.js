/**
 * Carpeta 'context': estado global que comparten muchas pantallas (sesión del
 * usuario, y más adelante el tema claro/oscuro). Usar Context evita pasar los
 * mismos datos por props a través de varias pantallas.
 */
export { AuthProvider, useAuth } from './AuthContext';
