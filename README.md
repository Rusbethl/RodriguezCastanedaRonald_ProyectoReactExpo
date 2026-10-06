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
- [ ] Navegación con React Navigation
- [ ] Inicio de sesión y registro
- [ ] Sesiones de estudio y medición del celular
- [ ] Historial, análisis, metas, notificaciones y logros
