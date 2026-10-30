/**
 * Decide qué pantallas se muestran según haya o no sesión iniciada.
 *
 *  - Sin sesión: pila de autenticación (Inicio de sesión y Registro).
 *  - Recién registrado: se pide completar el perfil (paso 2 del registro).
 *  - Con sesión: barra inferior (Inicio, Historial, Análisis, Perfil) y encima
 *    las pantallas que se abren desde ellas (sesión activa, metas, logros...).
 *
 * Las pantallas dibujan su propio encabezado, por eso headerShown va en false.
 */
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { Cargando } from '../components';
import { useAuth } from '../context';
import {
  AnalisisScreen,
  ConfiguracionScreen,
  HistorialScreen,
  InicioScreen,
  LoginScreen,
  LogrosScreen,
  MapaScreen,
  MateriasScreen,
  MetasScreen,
  NotificacionesScreen,
  PerfilScreen,
  RegistroScreen,
  SesionActivaScreen,
  SesionTerminadaScreen,
} from '../screens';
import { colores, fuentes } from '../theme';

const Pila = createNativeStackNavigator();
const Pestanas = createBottomTabNavigator();

const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colores.crema, primary: colores.verde },
};

const iconos = { Inicio: 'home', Historial: 'clock', Analisis: 'bar-chart-2', Perfil: 'user' };
const etiquetas = { Inicio: 'Inicio', Historial: 'Historial', Analisis: 'Análisis', Perfil: 'Perfil' };

function BarraInferior() {
  return (
    <Pestanas.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: etiquetas[route.name],
        tabBarActiveTintColor: colores.verde,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarLabelStyle: { fontFamily: fuentes.media, fontSize: 11, lineHeight: 15 },
        tabBarStyle: { backgroundColor: colores.blanco, borderTopColor: colores.borde, height: 64, paddingTop: 6, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => <Feather name={iconos[route.name]} size={size - 2} color={color} />,
      })}
    >
      <Pestanas.Screen name="Inicio" component={InicioScreen} />
      <Pestanas.Screen name="Historial" component={HistorialScreen} />
      <Pestanas.Screen name="Analisis" component={AnalisisScreen} />
      <Pestanas.Screen name="Perfil" component={PerfilScreen} />
    </Pestanas.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario, cargando, esNuevo } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colores.crema }}>
        <Cargando />
      </View>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      <Pila.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.crema } }}>
        {!usuario ? (
          <>
            <Pila.Screen name="Login" component={LoginScreen} />
            <Pila.Screen name="Registro" component={RegistroScreen} />
          </>
        ) : esNuevo ? (
          <Pila.Screen name="CompletarPerfil" component={PerfilScreen} />
        ) : (
          <>
            <Pila.Screen name="Tabs" component={BarraInferior} />
            <Pila.Screen name="SesionActiva" component={SesionActivaScreen} options={{ gestureEnabled: false }} />
            <Pila.Screen name="SesionTerminada" component={SesionTerminadaScreen} options={{ gestureEnabled: false }} />
            <Pila.Screen name="Materias" component={MateriasScreen} />
            <Pila.Screen name="Metas" component={MetasScreen} />
            <Pila.Screen name="Notificaciones" component={NotificacionesScreen} />
            <Pila.Screen name="Logros" component={LogrosScreen} />
            <Pila.Screen name="Mapa" component={MapaScreen} />
            <Pila.Screen name="Configuracion" component={ConfiguracionScreen} />
          </>
        )}
      </Pila.Navigator>
    </NavigationContainer>
  );
}
