/**
 * Pantalla 3 · Mi perfil.
 * Lee y guarda UsuarioProfile en GET/PATCH /api/perfil/. También sirve como paso 2
 * del registro y como menú para llegar a Materias, Metas, Logros y Configuración.
 */
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo, Cargando, Encabezado, MensajeError, Pantalla, Tarjeta } from '../components';
import { useAuth } from '../context';
import { useDatos } from '../hooks';
import { perfil as perfilApi } from '../services';
import { colores, fuentes } from '../theme';

const MENU = [
  { icono: 'book', texto: 'Mis materias', ruta: 'Materias' },
  { icono: 'target', texto: 'Mis metas', ruta: 'Metas' },
  { icono: 'award', texto: 'Logros y racha', ruta: 'Logros' },
  { icono: 'settings', texto: 'Configuración', ruta: 'Configuracion' },
];

export default function PerfilScreen({ navigation }) {
  const { usuario, esNuevo, terminarRegistro, recargarUsuario } = useAuth();
  const { datos, error, cargando, recargar } = useDatos(() => perfilApi.obtener());
  const [form, setForm] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (datos) setForm({ ...datos, fecha_nacimiento: datos.fecha_nacimiento ?? '' });
  }, [datos]);

  if (cargando || !form) return <Pantalla>{error ? <MensajeError mensaje={error} alReintentar={recargar} /> : <Cargando />}</Pantalla>;

  const cambiar = (campo) => (valor) => {
    setForm({ ...form, [campo]: valor });
    setAviso('');
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };

  const guardar = async () => {
    setGuardando(true);
    setErrores({});
    try {
      const { nombre, apellido, telefono, institucion, fecha_nacimiento } = form;
      const actualizado = await perfilApi.actualizar({ nombre, apellido, telefono, institucion, fecha_nacimiento: fecha_nacimiento || null });
      setForm({ ...actualizado, fecha_nacimiento: actualizado.fecha_nacimiento ?? '' });
      await recargarUsuario();
      if (esNuevo) terminarRegistro();
      else setAviso('Cambios guardados');
    } catch (e) {
      setErrores(e.campos ?? {});
      if (!Object.keys(e.campos ?? {}).length) setAviso(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const err = (c) => errores[c]?.[0];

  return (
    <Pantalla>
      {esNuevo ? (
        <>
          <Encabezado titulo="" regresar={false} accion={<Text style={estilos.paso}>Paso 2 de 2</Text>} />
          <Text style={estilos.tituloGrande}>Completa tu perfil</Text>
          <Text style={estilos.subtitulo}>Así personalizamos tu experiencia en FocusSync.</Text>
        </>
      ) : (
        <Encabezado titulo="Mi perfil" regresar={false} />
      )}

      <View style={estilos.avatarZona}>
        <View style={estilos.avatar}>
          <Text style={estilos.iniciales}>{form.iniciales}</Text>
        </View>
        <Text style={estilos.correo}>{usuario?.email}</Text>
      </View>

      <View style={estilos.fila}>
        <Campo estilo={{ flex: 1 }} etiqueta="Nombre" value={form.nombre} onChangeText={cambiar('nombre')} error={err('nombre')} />
        <Campo estilo={{ flex: 1 }} etiqueta="Apellido" value={form.apellido} onChangeText={cambiar('apellido')} error={err('apellido')} />
      </View>
      <Campo etiqueta="Fecha de nacimiento (AAAA-MM-DD)" icono="calendar" value={form.fecha_nacimiento} onChangeText={cambiar('fecha_nacimiento')} placeholder="2004-03-14" error={err('fecha_nacimiento')} />
      <Campo etiqueta="Teléfono" icono="phone" value={form.telefono} onChangeText={cambiar('telefono')} keyboardType="phone-pad" placeholder="10 dígitos" error={err('telefono')} />
      <Campo etiqueta="Institución" icono="home" value={form.institucion} onChangeText={cambiar('institucion')} placeholder="Ej. CESUN Universidad" error={err('institucion')} />

      {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}
      <Boton titulo={esNuevo ? 'Terminar registro' : 'Guardar cambios'} onPress={guardar} cargando={guardando} />
      {esNuevo && (
        <Pressable onPress={terminarRegistro} style={{ alignSelf: 'center', marginTop: 16 }}>
          <Text style={estilos.omitir}>Completar después</Text>
        </Pressable>
      )}

      {!esNuevo && (
        <Tarjeta estilo={{ marginTop: 24, paddingVertical: 4 }}>
          {MENU.map((item, i) => (
            <Pressable key={item.ruta} onPress={() => navigation.navigate(item.ruta)} style={[estilos.opcion, i < MENU.length - 1 && estilos.separador]}>
              <Feather name={item.icono} size={19} color={colores.verde} />
              <Text style={estilos.opcionTexto}>{item.texto}</Text>
              <Feather name="chevron-right" size={18} color={colores.textoSecundario} />
            </Pressable>
          ))}
        </Tarjeta>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  paso: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  tituloGrande: { fontFamily: fuentes.seminegrita, fontSize: 26, color: colores.texto },
  subtitulo: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario, marginTop: 4, marginBottom: 10 },
  avatarZona: { alignItems: 'center', marginBottom: 18 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colores.verdeSecundario, alignItems: 'center', justifyContent: 'center' },
  iniciales: { fontFamily: fuentes.seminegrita, fontSize: 32, color: colores.lima },
  correo: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario, marginTop: 8 },
  fila: { flexDirection: 'row', gap: 12 },
  aviso: { fontFamily: fuentes.media, fontSize: 13, color: colores.verde, textAlign: 'center', marginBottom: 10 },
  omitir: { fontFamily: fuentes.media, fontSize: 14, color: colores.textoSecundario },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15 },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  opcionTexto: { flex: 1, fontFamily: fuentes.media, fontSize: 14.5, color: colores.texto },
});
