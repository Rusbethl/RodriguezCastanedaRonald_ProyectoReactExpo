/**
 * Pantalla 8 · Historial de sesiones.
 * Lista paginada de GET /api/sesiones/ agrupada por día, con filtro por materia.
 * Mantener presionada una sesión permite borrarla (DELETE), por ejemplo si se registró por error.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cargando, Chip, DialogoConfirmacion, Encabezado, MensajeError, Pantalla, Tarjeta, Vacio } from '../components';
import { useDatos } from '../hooks';
import { useNotificaciones } from '../notificaciones';
import { materias as materiasApi, sesiones } from '../services';
import { colores, fuentes, imagenes } from '../theme';
import { etiquetaDia, hora } from '../utils';

const COLOR_NIVEL = {
  Alta: { fondo: colores.lima, texto: colores.verde },
  Media: { fondo: colores.cremaOscuro, texto: colores.texto },
  Baja: { fondo: colores.coralSuave, texto: '#A2401F' },
};

export default function HistorialScreen() {
  const [filtro, setFiltro] = useState(null);
  const { datos, setDatos, error, cargando, recargar, recargando } = useDatos(async () => {
    const [pagina, materias] = await Promise.all([sesiones.listar({ materia: filtro, en_curso: false }), materiasApi.listar()]);
    return { pagina, lista: pagina.results, materias };
  }, [filtro]);
  const [cargandoMas, setCargandoMas] = useState(false);
  const { avisar } = useNotificaciones();
  const [porBorrar, setPorBorrar] = useState(null); // sesión que espera confirmación
  const [borrando, setBorrando] = useState(false);

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const cargarMas = async () => {
    setCargandoMas(true);
    const pagina = await sesiones.siguientePagina(datos.pagina.next);
    setDatos({ ...datos, pagina, lista: [...datos.lista, ...pagina.results] });
    setCargandoMas(false);
  };

  // Mantener presionada una sesión solo abre el diálogo; borrar ocurre al confirmar
  const confirmarBorrado = async () => {
    setBorrando(true);
    try {
      await sesiones.eliminar(porBorrar.id);
      setDatos({ ...datos, lista: datos.lista.filter((s) => s.id !== porBorrar.id) });
      avisar({ tipo: 'exito', titulo: 'Sesión borrada' });
    } catch (e) {
      avisar({ tipo: 'error', titulo: 'No se pudo borrar', mensaje: e.message });
    } finally {
      setBorrando(false);
      setPorBorrar(null);
    }
  };

  const grupos = [];
  datos.lista.forEach((s) => {
    const dia = etiquetaDia(s.fecha_hora_inicio);
    if (grupos.at(-1)?.dia !== dia) grupos.push({ dia, sesiones: [] });
    grupos.at(-1).sesiones.push(s);
  });

  return (
    <Pantalla alRecargar={recargar} recargando={recargando}>
      <Encabezado titulo="Mis sesiones" regresar={false} />
      <View style={estilos.chips}>
        <Chip texto="Todas" activo={!filtro} onPress={() => setFiltro(null)} />
        {datos.materias.map((m) => (
          <Chip key={m.id} texto={m.nombre_materia} color={m.color_etiqueta} activo={filtro === m.id} onPress={() => setFiltro(m.id)} />
        ))}
      </View>

      {grupos.length === 0 && <Vacio imagen={imagenes.sinSesiones} mensaje="Todavía no hay sesiones aquí. Empieza una desde Inicio." />}
      {grupos.map((g) => (
        <View key={g.dia}>
          <Text style={estilos.dia}>{g.dia}</Text>
          {g.sesiones.map((s) => {
            const nivel = COLOR_NIVEL[s.nivel_enfoque_nombre] ?? COLOR_NIVEL.Media;
            return (
              <Tarjeta key={s.id} estilo={estilos.tarjeta}>
                <Pressable onLongPress={() => setPorBorrar(s)} delayLongPress={400}>
                  <View style={estilos.fila}>
                    <View style={[estilos.punto, { backgroundColor: s.materia_color }]} />
                    <Text style={estilos.materia}>{s.materia_nombre}</Text>
                    {s.nivel_enfoque_nombre && (
                      <Text style={[estilos.nivel, { backgroundColor: nivel.fondo, color: nivel.texto }]}>{s.nivel_enfoque_nombre}</Text>
                    )}
                  </View>
                  <Text style={estilos.horario}>{hora(s.fecha_hora_inicio)} – {hora(s.fecha_hora_fin)}</Text>
                  <View style={estilos.metricas}>
                    <Metrica icono="book-open" texto={`${s.duracion_estudio} min`} />
                    <Metrica icono="smartphone" texto={`${s.tiempo_pantalla} min`} color={colores.coral} />
                    <Metrica icono="unlock" texto={String(s.desbloqueos)} color={colores.textoSecundario} />
                    {s.apps.length > 0 && <Metrica icono="grid" texto={s.apps.map((a) => a.nombre_app).join(', ')} color={colores.textoSecundario} />}
                  </View>
                </Pressable>
              </Tarjeta>
            );
          })}
        </View>
      ))}
      {datos.pagina.next && (
        <Pressable onPress={cargarMas} style={estilos.mas}>
          <Text style={estilos.masTexto}>{cargandoMas ? 'Cargando…' : 'Ver sesiones anteriores'}</Text>
        </Pressable>
      )}
      {datos.lista.length > 0 && <Text style={estilos.ayuda}>Mantén presionada una sesión para borrarla.</Text>}

      <DialogoConfirmacion
        visible={!!porBorrar}
        icono="trash-2"
        titulo="Borrar sesión"
        mensaje={porBorrar ? `¿Borrar la sesión de ${porBorrar.materia_nombre}? Tus estadísticas se recalculan.` : ''}
        textoConfirmar="Borrar"
        peligroso
        cargando={borrando}
        alConfirmar={confirmarBorrado}
        alCancelar={() => setPorBorrar(null)}
      />
    </Pantalla>
  );
}

function Metrica({ icono, texto, color = colores.texto }) {
  return (
    <View style={estilos.metrica}>
      <Feather name={icono} size={13} color={color} />
      <Text style={[estilos.metricaTexto, { color }]} numberOfLines={1}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dia: { fontFamily: fuentes.media, fontSize: 12, color: colores.textoSecundario, marginTop: 14, marginBottom: 8, letterSpacing: 0.5 },
  tarjeta: { marginBottom: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 10, height: 10, borderRadius: 5 },
  materia: { flex: 1, fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto },
  nivel: { fontFamily: fuentes.seminegrita, fontSize: 11, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99, overflow: 'hidden' },
  horario: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario, marginTop: 3, marginBottom: 10 },
  metricas: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metrica: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' },
  metricaTexto: { fontFamily: fuentes.regular, fontSize: 13 },
  mas: { alignItems: 'center', padding: 14 },
  masTexto: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.verde },
  ayuda: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario, textAlign: 'center', marginTop: 8 },
});
