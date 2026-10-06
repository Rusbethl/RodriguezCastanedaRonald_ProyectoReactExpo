/** Barra horizontal de avance (metas, logros). El color cambia según lo que mide. */
import { StyleSheet, View } from 'react-native';

import { colores } from '../theme';

export default function BarraProgreso({ valor, color = colores.verde, alto = 8, estilo }) {
  const ancho = `${Math.max(0, Math.min(100, valor))}%`;
  return (
    <View style={[estilos.fondo, { height: alto }, estilo]}>
      <View style={[estilos.relleno, { width: ancho, backgroundColor: color }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { backgroundColor: colores.cremaOscuro, borderRadius: 99, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: 99 },
});
