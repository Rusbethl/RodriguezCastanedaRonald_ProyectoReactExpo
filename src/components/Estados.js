/**
 * Mensajes de carga, error y lista vacía. Cada pantalla que pide datos a la API
 * pasa por estos tres estados, así que se muestran siempre igual.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '../theme';
import Boton from './Boton';

export function Cargando() {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.verde} />
    </View>
  );
}

export function MensajeError({ mensaje, alReintentar }) {
  return (
    <View style={estilos.centro}>
      <Feather name="wifi-off" size={32} color={colores.coral} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {alReintentar && <Boton titulo="Reintentar" variante="contorno" onPress={alReintentar} estilo={{ alignSelf: 'stretch' }} />}
    </View>
  );
}

export function Vacio({ icono = 'inbox', imagen, mensaje }) {
  return (
    <View style={estilos.centro}>
      {imagen ? (
        <Image source={imagen} style={estilos.ilustracion} resizeMode="contain" />
      ) : (
        <Feather name={icono} size={30} color={colores.textoSecundario} />
      )}
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14 },
  ilustracion: { width: 180, height: 130 },
  texto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario, textAlign: 'center' },
});
