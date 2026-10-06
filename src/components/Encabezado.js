/**
 * Barra superior de las pantallas secundarias: botón de regresar, título y una
 * acción opcional a la derecha (por ejemplo "+" en Mis metas).
 */
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '../theme';

export function BotonIcono({ icono, onPress, oscuro = false, punto = false, etiqueta }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={etiqueta} style={[estilos.icono, oscuro && estilos.iconoOscuro]}>
      <Feather name={icono} size={20} color={oscuro ? colores.crema : colores.texto} />
      {punto && <View style={estilos.punto} />}
    </Pressable>
  );
}

export default function Encabezado({ titulo, regresar = true, accion }) {
  const navegacion = useNavigation();
  return (
    <View style={estilos.barra}>
      {regresar ? (
        <BotonIcono icono="chevron-left" onPress={() => navegacion.goBack()} etiqueta="Regresar" />
      ) : (
        <View style={estilos.hueco} />
      )}
      <Text style={estilos.titulo} numberOfLines={1}>{titulo}</Text>
      {accion ?? <View style={estilos.hueco} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 18 },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 20, color: colores.texto, flex: 1, textAlign: 'center' },
  hueco: { width: 40 },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoOscuro: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'transparent' },
  punto: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colores.coral },
});
