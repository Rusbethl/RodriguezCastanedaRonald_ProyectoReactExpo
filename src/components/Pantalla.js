/**
 * Marco común de cada pantalla: fondo crema, márgenes seguros (notch y barra de
 * estado) y scroll. Así ninguna pantalla repite esa configuración.
 */
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores, espaciado } from '../theme';

export default function Pantalla({ children, fondo = colores.crema, scroll = true, alRecargar, recargando = false, bordes = ['top'] }) {
  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: fondo }]} edges={bordes}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          refreshControl={alRecargar ? <RefreshControl refreshing={recargando} onRefresh={alRecargar} tintColor={colores.verde} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[estilos.contenido, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: 22, paddingTop: espaciado.sm, paddingBottom: 40 },
});
