/**
 * Pastilla seleccionable para filtros y opciones cortas (duración de la sesión,
 * materias del historial, tipo de meta).
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, fuentes } from '../theme';

export default function Chip({ texto, activo = false, onPress, color }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.activo]}>
      {color && <Text style={[estilos.punto, { color }]}>●</Text>}
      <Text style={[estilos.texto, activo && estilos.textoActivo]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colores.cremaOscuro,
  },
  activo: { backgroundColor: colores.verde },
  texto: { fontFamily: fuentes.media, fontSize: 12.5, color: colores.texto },
  textoActivo: { color: colores.crema },
  punto: { fontSize: 10 },
});
