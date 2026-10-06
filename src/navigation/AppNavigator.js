/**
 * Decide qué pantallas se muestran según haya o no sesión iniciada.
 *
 * Separar la navegación de las pantallas permite cambiar el flujo (por ejemplo,
 * mandar al usuario sin sesión al login) sin modificar cada pantalla. En la
 * siguiente entrega aquí se instalará React Navigation con:
 *   - Pila de autenticación: Inicio de sesión y Registro.
 *   - Barra inferior: Inicio, Historial, Análisis y Perfil.
 */
import { BienvenidaScreen } from '../screens';

export default function AppNavigator() {
  return <BienvenidaScreen />;
}
