/**
 * Campo de texto con etiqueta, ícono y mensaje de error.
 * Lo usan todos los formularios (login, registro, perfil, materias, metas) para que
 * los errores que regresa la API se muestren siempre debajo del campo correcto.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { alturas, colores, fuentes, radios } from '../theme';

export default function Campo({ etiqueta, icono, error, secreto = false, oscuro = false, estilo, ...props }) {
  const [oculto, setOculto] = useState(secreto);
  const [enfocado, setEnfocado] = useState(false);
  const tema = oscuro ? temaOscuro : temaClaro;

  return (
    <View style={[estilos.contenedor, estilo]}>
      {etiqueta && <Text style={[estilos.etiqueta, tema.etiqueta]}>{etiqueta}</Text>}
      <View style={[estilos.caja, tema.caja, enfocado && tema.enfocado, error && estilos.cajaError]}>
        {icono && <Feather name={icono} size={18} color={tema.icono} />}
        <TextInput
          style={[estilos.input, tema.input]}
          placeholderTextColor={tema.placeholder}
          secureTextEntry={oculto}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          {...props}
        />
        {secreto && (
          <Pressable onPress={() => setOculto(!oculto)} hitSlop={10} accessibilityLabel="Mostrar u ocultar contraseña">
            <Feather name={oculto ? 'eye' : 'eye-off'} size={19} color={tema.icono} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const temaClaro = {
  etiqueta: { color: colores.textoSecundario },
  caja: { backgroundColor: colores.blanco, borderColor: colores.borde },
  enfocado: { borderColor: colores.verde },
  input: { color: colores.texto },
  icono: colores.textoSecundario,
  placeholder: '#A5ADA8',
};

const temaOscuro = {
  etiqueta: { color: '#BFD3CB' },
  caja: { backgroundColor: '#135646', borderColor: '#1E6B58' },
  enfocado: { borderColor: colores.lima },
  input: { color: colores.crema },
  icono: '#BFD3CB',
  placeholder: '#7FA597',
};

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontFamily: fuentes.media, fontSize: 12.5, marginBottom: 6 },
  caja: {
    height: alturas.campo,
    borderWidth: 1,
    borderRadius: radios.campo,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  cajaError: { borderColor: colores.coral },
  input: { flex: 1, minWidth: 0, fontFamily: fuentes.regular, fontSize: 14.5, height: '100%', outlineStyle: 'none' },
  error: { color: colores.coral, fontFamily: fuentes.regular, fontSize: 12, marginTop: 4 },
});
