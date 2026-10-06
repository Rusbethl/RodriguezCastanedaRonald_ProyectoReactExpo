/**
 * Pantalla temporal de bienvenida.
 *
 * Sirve para comprobar que la estructura inicial funciona en Expo Go mientras se
 * construyen las 13 pantallas del diseño (Inicio de sesión, Registro, Inicio...).
 * Se reemplazará por la pantalla de Inicio de sesión en la siguiente entrega.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components';
import { API_URL } from '../services';
import { colores, espaciado } from '../theme';

export default function BienvenidaScreen() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>FocusSync</Text>
      <Text style={estilos.subtitulo}>Estudia de verdad. Mide lo que el celular te quita.</Text>
      <View style={estilos.boton}>
        <Boton titulo="Comenzar" variante="lima" onPress={() => {}} />
      </View>
      <Text style={estilos.api}>API: {API_URL}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
  },
  titulo: { fontSize: 34, fontWeight: '700', color: colores.crema },
  subtitulo: { fontSize: 15, color: colores.crema, opacity: 0.8, marginTop: espaciado.sm, textAlign: 'center' },
  boton: { alignSelf: 'stretch', marginTop: espaciado.xl },
  api: { position: 'absolute', bottom: espaciado.xl, fontSize: 11, color: colores.crema, opacity: 0.5 },
});
