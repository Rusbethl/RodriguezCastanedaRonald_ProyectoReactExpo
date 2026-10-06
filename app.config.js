/**
 * app.config.js — configuración de Expo para FocusSync.
 *
 * Usamos app.config.js en lugar de app.json porque JSON no admite comentarios
 * y porque así podemos leer variables de entorno (por ejemplo, la URL de la API)
 * sin escribirlas directamente en el código que se sube a GitHub.
 */
export default {
  expo: {
    // Nombre que ve el usuario debajo del ícono y slug que identifica el proyecto en Expo.
    name: 'FocusSync',
    slug: 'focussync',
    version: '1.0.0',

    // La app se diseñó solo en vertical (ver pantallas de la fase de diseño).
    orientation: 'portrait',
    icon: './assets/icon.png',

    // Por ahora solo tema claro; el tema oscuro llegará con la pantalla de Configuración.
    userInterfaceStyle: 'light',

    // Color de fondo del splash: el verde principal de la paleta de FocusSync.
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0B4A3B',
    },

    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.focussync.app',
    },

    android: {
      package: 'com.focussync.app',
      adaptiveIcon: {
        backgroundColor: '#0B4A3B',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },

    web: {
      favicon: './assets/favicon.png',
    },

    // 'extra' expone valores al código mediante expo-constants.
    // La URL del backend (Django REST Framework) se toma del archivo .env para no
    // dejar la IP de la computadora de desarrollo escrita en el repositorio.
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api',
    },
  },
};
