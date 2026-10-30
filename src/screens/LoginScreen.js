/**
 * Pantalla 1 · Inicio de sesión.
 * Autentica con correo y contraseña contra POST /api/auth/login/. Los errores de la
 * API (correo o contraseña incorrectos, cuenta inactiva) se muestran en pantalla.
 */
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo, Pantalla } from '../components';
import { useAuth } from '../context';
import { auth } from '../services';
import { colores, fuentes, imagenes } from '../theme';

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    if (!email.trim() || !password) return setError('Escribe tu correo y tu contraseña.');
    setEnviando(true);
    setError('');
    try {
      await iniciarSesion(email.trim(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const recuperar = async () => {
    if (!email.trim()) return setError('Escribe tu correo arriba para enviarte las instrucciones.');
    try {
      const r = await auth.recuperar(email.trim());
      Alert.alert('Recuperar contraseña', r.detail);
      if (Platform.OS === 'web') setError(r.detail);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Pantalla fondo={colores.verde} bordes={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={estilos.logo}>
          <Image source={imagenes.logo} style={estilos.icono} accessibilityLabel="Logo de FocusSync" />
          <Text style={estilos.marca}>FocusSync</Text>
          <Text style={estilos.lema}>Estudia de verdad. Mide lo que el celular te quita.</Text>
        </View>

        <Campo
          oscuro
          etiqueta="Correo electrónico"
          icono="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Campo
          oscuro
          secreto
          etiqueta="Contraseña"
          icono="lock"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          onSubmitEditing={entrar}
        />
        <Pressable onPress={recuperar} style={estilos.olvide}>
          <Text style={estilos.enlace}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        {error ? <Text style={estilos.error}>{error}</Text> : null}
        <Boton titulo="Iniciar sesión" variante="lima" onPress={entrar} cargando={enviando} />

        <Pressable onPress={() => navigation.navigate('Registro')} style={estilos.registro}>
          <Text style={estilos.registroTexto}>
            ¿No tienes cuenta? <Text style={estilos.enlace}>Regístrate</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 56, marginBottom: 48 },
  icono: { width: 72, height: 72 },
  marca: { fontFamily: fuentes.seminegrita, fontSize: 34, color: colores.crema, marginTop: 14 },
  lema: { fontFamily: fuentes.regular, fontSize: 14, color: colores.crema, opacity: 0.75, textAlign: 'center', marginTop: 4 },
  olvide: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 24 },
  enlace: { fontFamily: fuentes.seminegrita, fontSize: 13, color: colores.lima },
  error: { fontFamily: fuentes.regular, fontSize: 13, color: '#FFB49C', marginBottom: 12, textAlign: 'center' },
  registro: { marginTop: 26, alignItems: 'center' },
  registroTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.crema },
});
