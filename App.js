/**
 * App.js — componente raíz de FocusSync.
 *
 * Se mantiene lo más pequeño posible a propósito: solo envuelve la app con los
 * "proveedores" globales y le entrega el control a la navegación. Así, cuando
 * agreguemos sesión de usuario, tema o navegación real, cada cosa vive en su
 * carpeta dentro de src/ y este archivo casi no cambia.
 */
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // AuthProvider guardará el usuario y el token JWT para que cualquier pantalla
    // sepa si hay sesión iniciada sin pasar datos de pantalla en pantalla.
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
