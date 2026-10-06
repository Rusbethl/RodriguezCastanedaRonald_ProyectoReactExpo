/**
 * Contenedor blanco con borde y esquinas redondeadas que agrupa información
 * (resúmenes, sesiones, metas). Centraliza la sombra suave del diseño.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { colores, radios } from '../theme';

export default function Tarjeta({ children, estilo, onPress, oscura = false }) {
  const Contenedor = onPress ? Pressable : View;
  return (
    <Contenedor onPress={onPress} style={[estilos.tarjeta, oscura && estilos.oscura, estilo]}>
      {children}
    </Contenedor>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    shadowColor: colores.verde,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  oscura: { backgroundColor: colores.verde, borderColor: colores.verde },
});
