/**
 * App.js — componente raíz de FocusSync.
 *
 * Carga las fuentes (Poppins y JetBrains Mono), configura el audio, envuelve la app con
 * los proveedores globales (área segura, sesión del usuario y avisos) y le entrega el
 * control a la navegación.
 */
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { setAudioModeAsync } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificacionesProvider } from './src/notificaciones';
import { colores, fuentesLocales } from './src/theme';

export default function App() {
  // Poppins viene de npm y JetBrainsMono de assets/fonts; useFonts carga las dos igual
  const [fuentesListas] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, ...fuentesLocales });

  // Sonidos discretos: respetan el modo silencio y no detienen la música del usuario
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }, []);

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
        <NotificacionesProvider>
          <AppNavigator />
          <StatusBar style="dark" />
        </NotificacionesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
