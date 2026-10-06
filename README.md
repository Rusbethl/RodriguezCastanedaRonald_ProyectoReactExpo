# FocusSync · App móvil (React Native + Expo)

App para estudiantes que mide cuánto tiempo estudian y cuánto tiempo pierden en el celular durante cada sesión. Se conecta a la API de FocusSync hecha en Django REST Framework.

## Requisitos

- Node.js 20 o superior y npm
- App **Expo Go** en el celular (Android o iOS)

## Cómo correrlo

```bash
npm install
cp .env.example .env   # en Windows: copy .env.example .env
npx expo start
```

Escanea el código QR con Expo Go. El celular y la computadora deben estar en la misma red Wi-Fi.

### Conectar con la API

En el celular `localhost` apunta al propio celular, no a la computadora. Por eso:

1. Saca la IP de tu computadora con `ipconfig` (dirección IPv4, por ejemplo `192.168.1.70`).
2. En el archivo `.env` pon `EXPO_PUBLIC_API_URL=http://192.168.1.70:8000/api`.
3. Corre el backend escuchando en toda la red: `python manage.py runserver 0.0.0.0:8000`.
4. Reinicia Expo con `npx expo start -c` para que tome el cambio.

Para probar en el navegador de la computadora: `npx expo start --web` (ahí sí funciona `localhost`).

Usuario de prueba (se crea con `python manage.py cargar_demo`): `demo@focussync.app` / `FocusSync2026`.

### Cómo se mide el uso del celular

Expo Go no permite leer las estadísticas de uso de otras apps. La app usa `AppState`: cada vez que sales de FocusSync durante una sesión cuenta como un desbloqueo y el tiempo fuera se suma al tiempo en el celular. Al terminar, el usuario puede corregir el tiempo y marcar qué apps usó.

## Estructura del proyecto

```
├── App.js              Componente raíz: proveedores globales + navegación
├── index.js            Punto de entrada que registra App en Expo
├── app.config.js       Configuración de Expo (nombre, íconos, colores, URL de la API)
├── .env.example        Variables de entorno de ejemplo (el .env real no se sube)
├── assets/             Íconos y splash de la app
└── src/
    ├── screens/        Una pantalla completa por archivo (las 13 del diseño)
    ├── components/     Piezas visuales reutilizables (botones, campos, tarjetas)
    ├── navigation/     Flujo entre pantallas (login y barra inferior)
    ├── services/       Llamadas a la API de Django REST Framework
    ├── context/        Estado global (sesión del usuario)
    ├── hooks/          Lógica reutilizable (cronómetro, tiempo en pantalla)
    ├── theme/          Colores y medidas del diseño
    └── utils/          Funciones de formato y cálculo
```

## Estado

- [x] Estructura inicial, tema visual y cliente de la API
- [x] Navegación con React Navigation (pila de login y barra inferior)
- [x] Inicio de sesión, registro en dos pasos y cierre de sesión
- [x] Sesiones de estudio con cronómetro, pausas y medición del celular
- [x] Historial, materias, análisis semanal, metas, notificaciones, logros y configuración
