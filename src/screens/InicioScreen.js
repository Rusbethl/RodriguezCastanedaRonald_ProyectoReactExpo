/**
 * Pantalla 5 · Inicio.
 * Resumen del día (GET /api/inicio/), elegir materia y duración, e iniciar una
 * sesión (POST /api/sesiones/). Si hay una sesión en curso la retoma.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarraProgreso, BotonIcono, Boton, Cargando, Chip, MensajeError, Pantalla, Tarjeta } from '../components';
import { useDatos } from '../hooks';
import { inicio, materias as materiasApi, sesiones } from '../services';
import { colores, fuentes } from '../theme';
import { fechaLarga, formatearMinutos } from '../utils';

const DURACIONES = [25, 45, 60, null]; // null = libre

export default function InicioScreen({ navigation }) {
  const { datos, error, cargando, recargar, recargando } = useDatos(async () => {
    const [resumen, materias] = await Promise.all([inicio.resumen(), materiasApi.listar()]);
    return { resumen, materias };
  });
  const [materiaId, setMateriaId] = useState(null);
  const [duracion, setDuracion] = useState(45);
  const [abrirSelector, setAbrirSelector] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [aviso, setAviso] = useState('');

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const { resumen, materias } = datos;
  const materia = materias.find((m) => m.id === materiaId) ?? materias[0];
  const meta = resumen.meta_activa;

  const iniciar = async () => {
    if (!materia) return navigation.navigate('Materias');
    setIniciando(true);
    setAviso('');
    try {
      const sesion = await sesiones.iniciar(materia.id);
      navigation.navigate('SesionActiva', { sesion, duracion });
    } catch (e) {
      setAviso(e.message);
    } finally {
      setIniciando(false);
    }
  };

  const retomar = async () => navigation.navigate('SesionActiva', { sesion: await sesiones.activa(), duracion: null });

  return (
    <Pantalla alRecargar={recargar} recargando={recargando}>
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.fecha}>{fechaLarga(resumen.fecha)}</Text>
          <Text style={estilos.saludo}>Hola, {resumen.nombre}</Text>
        </View>
        <BotonIcono icono="bell" etiqueta="Notificaciones" punto={resumen.notificaciones_sin_leer > 0} onPress={() => navigation.navigate('Notificaciones')} />
      </View>

      <Tarjeta oscura>
        <View style={estilos.filaEntre}>
          <Text style={estilos.hoy}>Hoy llevas</Text>
          <View style={estilos.racha}>
            <Feather name="zap" size={13} color={colores.lima} />
            <Text style={estilos.rachaTexto}>{resumen.racha} {resumen.racha === 1 ? 'día' : 'días'} de racha</Text>
          </View>
        </View>
        <View style={estilos.cifras}>
          <View>
            <Text style={estilos.cifra}>{formatearMinutos(resumen.hoy.minutos_estudio)}</Text>
            <Text style={estilos.cifraEtiqueta}>de estudio</Text>
          </View>
          <View>
            <Text style={[estilos.cifra, { color: '#FFB49C' }]}>{formatearMinutos(resumen.hoy.minutos_pantalla)}</Text>
            <Text style={estilos.cifraEtiqueta}>en el celular</Text>
          </View>
        </View>
      </Tarjeta>

      {resumen.sesion_en_curso ? (
        <Tarjeta estilo={{ marginTop: 18, borderColor: colores.verde }}>
          <Text style={estilos.seccionChica}>Tienes una sesión en curso</Text>
          <Boton titulo="Volver a la sesión" icono="play" onPress={retomar} estilo={{ marginTop: 10 }} />
        </Tarjeta>
      ) : (
        <>
          <Text style={estilos.seccion}>Nueva sesión de estudio</Text>
          <Text style={estilos.etiqueta}>¿Qué vas a estudiar?</Text>
          {materias.length === 0 ? (
            <Boton titulo="Agrega tu primera materia" variante="contorno" icono="plus" onPress={() => navigation.navigate('Materias')} />
          ) : (
            <>
              <Pressable style={estilos.selector} onPress={() => setAbrirSelector(!abrirSelector)}>
                <View style={[estilos.punto, { backgroundColor: materia.color_etiqueta }]} />
                <Text style={estilos.selectorTexto}>{materia.nombre_materia}</Text>
                <Feather name={abrirSelector ? 'chevron-up' : 'chevron-down'} size={18} color={colores.textoSecundario} />
              </Pressable>
              {abrirSelector && (
                <Tarjeta estilo={estilos.lista}>
                  {materias.map((m) => (
                    <Pressable key={m.id} style={estilos.opcion} onPress={() => { setMateriaId(m.id); setAbrirSelector(false); }}>
                      <View style={[estilos.punto, { backgroundColor: m.color_etiqueta }]} />
                      <Text style={estilos.selectorTexto}>{m.nombre_materia}</Text>
                      {m.id === materia.id && <Feather name="check" size={16} color={colores.verde} />}
                    </Pressable>
                  ))}
                </Tarjeta>
              )}
              <View style={estilos.chips}>
                {DURACIONES.map((d) => (
                  <Chip key={String(d)} texto={d ? `${d} min` : 'Libre'} activo={duracion === d} onPress={() => setDuracion(d)} />
                ))}
              </View>
              {aviso ? <Text style={estilos.error}>{aviso}</Text> : null}
              <Boton titulo="Iniciar sesión de estudio" icono="play" onPress={iniciar} cargando={iniciando} />
            </>
          )}
        </>
      )}

      <Text style={estilos.seccion}>Meta activa</Text>
      {meta ? (
        <Tarjeta onPress={() => navigation.navigate('Metas')}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.metaTexto}>{meta.tipo_meta_nombre}: {Number(meta.valor_objetivo)}</Text>
            <Text style={estilos.metaValor}>{meta.avance}%</Text>
          </View>
          <BarraProgreso valor={meta.avance} estilo={{ marginTop: 10 }} />
        </Tarjeta>
      ) : (
        <Tarjeta onPress={() => navigation.navigate('Metas')}>
          <Text style={estilos.metaTexto}>Aún no tienes metas. Toca para crear una.</Text>
        </Tarjeta>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 18 },
  fecha: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  saludo: { fontFamily: fuentes.seminegrita, fontSize: 22, color: colores.texto },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hoy: { fontFamily: fuentes.regular, fontSize: 13, color: colores.crema, opacity: 0.8 },
  racha: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(221,245,138,0.16)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  rachaTexto: { fontFamily: fuentes.media, fontSize: 12, color: colores.lima },
  cifras: { flexDirection: 'row', gap: 32, marginTop: 10 },
  cifra: { fontFamily: fuentes.seminegrita, fontSize: 30, color: colores.crema },
  cifraEtiqueta: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.crema, opacity: 0.75 },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 22, marginBottom: 10 },
  seccionChica: { fontFamily: fuentes.media, fontSize: 14, color: colores.texto },
  etiqueta: { fontFamily: fuentes.media, fontSize: 12.5, color: colores.textoSecundario, marginBottom: 6 },
  selector: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  selectorTexto: { flex: 1, fontFamily: fuentes.regular, fontSize: 14.5, color: colores.texto },
  punto: { width: 10, height: 10, borderRadius: 5 },
  lista: { marginTop: 6, paddingVertical: 4 },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  chips: { flexDirection: 'row', gap: 8, marginVertical: 14, flexWrap: 'wrap' },
  error: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.coral, marginBottom: 10 },
  metaTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.texto },
  metaValor: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
});
