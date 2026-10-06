/**
 * Pantalla 2 · Registro (paso 1 de 2).
 * Crea la cuenta en POST /api/auth/registro/. El backend crea en automático el
 * perfil, la configuración, la racha, las alertas y el rol "Estudiante". Al terminar,
 * la navegación lleva al paso 2 (completar el perfil).
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo, Encabezado, Pantalla } from '../components';
import { useAuth } from '../context';
import { colores, fuentes } from '../theme';

/** 0 a 4 según largo, mayúsculas, números y símbolos. */
function seguridad(password) {
  let puntos = 0;
  if (password.length >= 8) puntos++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) puntos++;
  if (/\d/.test(password)) puntos++;
  if (/[^A-Za-z0-9]/.test(password)) puntos++;
  return puntos;
}
const NIVELES = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];

export default function RegistroScreen() {
  const { registrarse } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo) => (valor) => {
    setForm({ ...form, [campo]: valor });
    // El error de un campo desaparece en cuanto el usuario lo corrige
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };
  const nivel = seguridad(form.password);

  const crear = async () => {
    setEnviando(true);
    setErrores({});
    try {
      await registrarse({ ...form, email: form.email.trim(), acepta_terminos: acepta });
    } catch (e) {
      setErrores({ ...e.campos, general: e.campos?.non_field_errors?.[0] ?? (Object.keys(e.campos ?? {}).length ? null : e.message) });
    } finally {
      setEnviando(false);
    }
  };

  const err = (campo) => errores[campo]?.[0] ?? errores[campo];

  return (
    <Pantalla>
      <Encabezado titulo="" accion={<Text style={estilos.paso}>Paso 1 de 2</Text>} />
      <Text style={estilos.titulo}>Crea tu cuenta</Text>
      <Text style={estilos.subtitulo}>Con estos datos vas a entrar a la app.</Text>

      <Campo etiqueta="Nombre de usuario" icono="at-sign" value={form.username} onChangeText={cambiar('username')} autoCapitalize="none" error={err('username')} />
      <Campo etiqueta="Correo electrónico" icono="mail" value={form.email} onChangeText={cambiar('email')} keyboardType="email-address" autoCapitalize="none" error={err('email')} />
      <Campo etiqueta="Contraseña" icono="lock" secreto value={form.password} onChangeText={cambiar('password')} error={err('password')} estilo={{ marginBottom: 8 }} />
      <View style={estilos.barras}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[estilos.barra, i < nivel && { backgroundColor: nivel < 2 ? colores.coral : colores.verde }]} />
        ))}
      </View>
      <Text style={estilos.nivel}>Seguridad: {form.password ? NIVELES[nivel].toLowerCase() : '—'}</Text>
      <Campo etiqueta="Confirmar contraseña" icono="lock" secreto value={form.password2} onChangeText={cambiar('password2')} error={err('password2')} />

      <Pressable style={estilos.terminos} onPress={() => { setAcepta(!acepta); setErrores({ ...errores, acepta_terminos: undefined }); }} accessibilityRole="checkbox" accessibilityState={{ checked: acepta }}>
        <View style={[estilos.casilla, acepta && estilos.casillaActiva]}>
          {acepta && <Feather name="check" size={14} color={colores.blanco} />}
        </View>
        <Text style={estilos.terminosTexto}>Acepto los términos y el aviso de privacidad</Text>
      </Pressable>
      {err('acepta_terminos') && <Text style={estilos.error}>{err('acepta_terminos')}</Text>}
      {errores.general && <Text style={estilos.error}>{errores.general}</Text>}

      <Boton titulo="Continuar" onPress={crear} cargando={enviando} estilo={{ marginTop: 12 }} />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  paso: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 26, color: colores.texto },
  subtitulo: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario, marginTop: 4, marginBottom: 22 },
  barras: { flexDirection: 'row', gap: 6 },
  barra: { flex: 1, height: 5, borderRadius: 9, backgroundColor: colores.borde },
  nivel: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario, marginTop: 6, marginBottom: 14 },
  terminos: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  casilla: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colores.borde, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.blanco },
  casillaActiva: { backgroundColor: colores.verde, borderColor: colores.verde },
  terminosTexto: { fontFamily: fuentes.regular, fontSize: 13, color: colores.texto, flex: 1 },
  error: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.coral, marginTop: 4 },
});
