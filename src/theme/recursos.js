/**
 * Registro de recursos estáticos (imágenes, fuentes y sonidos).
 * Metro necesita que la ruta de cada require sea un texto fijo, así que todos se hacen
 * aquí, en un solo lugar. Las pantallas importan el objeto que necesitan:
 *   import { imagenes, sonidos } from '../theme';
 * Las imágenes tienen versiones @2x y @3x; React Native elige la que corresponde a la
 * densidad de la pantalla.
 */
export const imagenes = {
  logo: require('../../assets/images/logo.png'),
  sinSesiones: require('../../assets/images/sin-sesiones.png'),
};

export const fuentesLocales = {
  JetBrainsMono: require('../../assets/fonts/JetBrainsMono-SemiBold.ttf'),
};

export const sonidos = {
  finSesion: require('../../assets/sounds/fin-sesion.mp3'),
  sesionGuardada: require('../../assets/sounds/sesion-guardada.mp3'),
  logro: require('../../assets/sounds/logro.mp3'),
};
