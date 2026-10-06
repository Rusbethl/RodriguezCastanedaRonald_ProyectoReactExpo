/**
 * App.js — componente raíz de FocusSync.
 *
 * Carga la tipografía Poppins, envuelve la app con los proveedores globales
 * (área segura y sesión del usuario) y le entrega el control a la navegación.
 */
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context';
import AppNavigator from './src/navigation/AppNavigator';
import { colores } from './src/theme';

export default function App() {
  const [fuentesListas] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  if (!fuentesListas) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colores.crema }}>
        <ActivityIndicator color={colores.verde} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
