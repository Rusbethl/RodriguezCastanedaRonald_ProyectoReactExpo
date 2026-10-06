/**
 * Botón principal de FocusSync.
 *
 * Está en 'components' porque se repite en casi todas las pantallas (Iniciar sesión,
 * Guardar cambios, Iniciar sesión de estudio...). Definirlo una vez garantiza que
 * todos tengan el mismo tamaño, color y radio que en los diseños.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { alturas, colores, fuentes, radios } from '../theme';

export default function Boton({ titulo, onPress, variante = 'principal', icono, cargando = false, deshabilitado = false, estilo }) {
  const v = variantes[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      style={({ pressed }) => [estilos.base, v.fondo, (pressed || inactivo) && estilos.atenuado, estilo]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto.color} />
      ) : (
        <>
          {icono && <Feather name={icono} size={18} color={v.texto.color} />}
          <Text style={[estilos.texto, v.texto]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const variantes = {
  principal: { fondo: { backgroundColor: colores.verde }, texto: { color: colores.crema } },
  lima: { fondo: { backgroundColor: colores.lima }, texto: { color: colores.verde } },
  coral: { fondo: { backgroundColor: colores.coral }, texto: { color: colores.blanco } },
  contorno: {
    fondo: { borderWidth: 1.5, borderColor: colores.verde, backgroundColor: 'transparent' },
    texto: { color: colores.verde },
  },
  contornoClaro: {
    fondo: { borderWidth: 1.5, borderColor: 'rgba(255,246,232,0.5)', backgroundColor: 'transparent' },
    texto: { color: colores.crema },
  },
};

const estilos = StyleSheet.create({
  base: {
    height: alturas.boton,
    borderRadius: radios.boton,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  texto: { fontSize: 16, fontFamily: fuentes.seminegrita },
  atenuado: { opacity: 0.6 },
});
