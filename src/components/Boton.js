/**
 * Botón principal de FocusSync.
 *
 * Está en 'components' porque se repite en casi todas las pantallas (Iniciar sesión,
 * Guardar cambios, Iniciar sesión de estudio...). Definirlo una vez garantiza que
 * todos tengan el mismo tamaño, color y radio que en los diseños.
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { alturas, colores, radios } from '../theme';

export default function Boton({ titulo, onPress, variante = 'principal', deshabilitado = false }) {
  const estilosVariante = variantes[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        estilos.base,
        estilosVariante.fondo,
        (pressed || deshabilitado) && estilos.atenuado,
      ]}
    >
      <Text style={[estilos.texto, estilosVariante.texto]}>{titulo}</Text>
    </Pressable>
  );
}

const variantes = {
  principal: { fondo: { backgroundColor: colores.verde }, texto: { color: colores.crema } },
  lima: { fondo: { backgroundColor: colores.lima }, texto: { color: colores.verde } },
  contorno: {
    fondo: { borderWidth: 1.5, borderColor: colores.verde, backgroundColor: 'transparent' },
    texto: { color: colores.verde },
  },
};

const estilos = StyleSheet.create({
  base: {
    height: alturas.boton,
    borderRadius: radios.boton,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  texto: { fontSize: 16, fontWeight: '600' },
  atenuado: { opacity: 0.6 },
});
