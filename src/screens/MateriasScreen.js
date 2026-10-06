/**
 * Pantalla 9 · Mis materias.
 * CRUD de /api/materias/. Una materia con sesiones no se puede borrar (el backend
 * responde 409), así que se ofrece archivarla para no perder el historial.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo, Cargando, Encabezado, MensajeError, Pantalla, Tarjeta, Vacio } from '../components';
import { useDatos } from '../hooks';
import { materias as materiasApi } from '../services';
import { colores, fuentes } from '../theme';
import { formatearMinutos } from '../utils';

const COLORES = ['#3D7BE0', '#E0A33D', '#9A5FD0', '#2E9E6B', '#E0643F', '#D14D8B', '#5E6B66'];

export default function MateriasScreen() {
  const { datos, setDatos, error, cargando, recargar } = useDatos(() => materiasApi.listar());
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(COLORES[0]);
  const [editando, setEditando] = useState(null);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const limpiar = () => { setNombre(''); setColor(COLORES[0]); setEditando(null); setErrorForm(''); };

  const guardar = async () => {
    if (!nombre.trim()) return setErrorForm('Escribe el nombre de la materia.');
    setGuardando(true);
    setErrorForm('');
    try {
      if (editando) await materiasApi.actualizar(editando, { nombre_materia: nombre, color_etiqueta: color });
      else await materiasApi.crear({ nombre_materia: nombre, color_etiqueta: color });
      limpiar();
      setDatos(await materiasApi.listar());
    } catch (e) {
      setErrorForm(e.campos?.nombre_materia?.[0] ?? e.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (m) => {
    setAviso('');
    try {
      await materiasApi.eliminar(m.id);
    } catch (e) {
      if (e.estado !== 409) return setAviso(e.message);
      await materiasApi.actualizar(m.id, { archivada: true });
      setAviso(`“${m.nombre_materia}” tenía sesiones, así que se archivó. Tu historial se conserva.`);
    }
    limpiar();
    setDatos(await materiasApi.listar());
  };

  const editar = (m) => { setEditando(m.id); setNombre(m.nombre_materia); setColor(m.color_etiqueta); setErrorForm(''); };

  return (
    <Pantalla>
      <Encabezado titulo="Mis materias" />
      {datos.length === 0 ? (
        <Vacio icono="book" mensaje="Agrega las materias de tu semestre para clasificar tus sesiones." />
      ) : (
        <Tarjeta estilo={{ paddingVertical: 4 }}>
          {datos.map((m, i) => (
            <View key={m.id} style={[estilos.fila, i < datos.length - 1 && estilos.separador]}>
              <View style={[estilos.barra, { backgroundColor: m.color_etiqueta }]} />
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombre}>{m.nombre_materia}</Text>
                <Text style={estilos.detalle}>{m.total_sesiones} sesiones · {formatearMinutos(m.total_minutos)}</Text>
              </View>
              <Pressable onPress={() => editar(m)} hitSlop={8} accessibilityLabel={`Editar ${m.nombre_materia}`}>
                <Feather name="edit-2" size={17} color={colores.textoSecundario} />
              </Pressable>
              <Pressable onPress={() => eliminar(m)} hitSlop={8} style={{ marginLeft: 16 }} accessibilityLabel={`Eliminar ${m.nombre_materia}`}>
                <Feather name={m.total_sesiones ? 'archive' : 'trash-2'} size={17} color={colores.coral} />
              </Pressable>
            </View>
          ))}
        </Tarjeta>
      )}
      {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}

      <Text style={estilos.seccion}>{editando ? 'Editar materia' : 'Agregar materia'}</Text>
      <Tarjeta>
        <Campo etiqueta="Nombre de la materia" value={nombre} onChangeText={setNombre} placeholder="Ej. Estructura de Datos" error={errorForm} />
        <Text style={estilos.etiqueta}>Color de etiqueta</Text>
        <View style={estilos.colores}>
          {COLORES.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[estilos.color, { backgroundColor: c }, color === c && estilos.colorActivo]} accessibilityLabel={`Color ${c}`} />
          ))}
        </View>
        <Boton titulo={editando ? 'Guardar cambios' : 'Agregar'} icono={editando ? 'check' : 'plus'} onPress={guardar} cargando={guardando} />
        {editando && <Boton titulo="Cancelar" variante="contorno" onPress={limpiar} estilo={{ marginTop: 10 }} />}
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  barra: { width: 10, height: 36, borderRadius: 5 },
  nombre: { fontFamily: fuentes.media, fontSize: 14.5, color: colores.texto },
  detalle: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 22, marginBottom: 10 },
  etiqueta: { fontFamily: fuentes.media, fontSize: 12.5, color: colores.textoSecundario, marginBottom: 8 },
  colores: { flexDirection: 'row', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  color: { width: 32, height: 32, borderRadius: 16 },
  colorActivo: { borderWidth: 3, borderColor: colores.blanco, outlineWidth: 2, outlineColor: colores.texto, outlineStyle: 'solid', transform: [{ scale: 1.1 }] },
  aviso: { fontFamily: fuentes.regular, fontSize: 13, color: colores.verde, marginTop: 10 },
});
