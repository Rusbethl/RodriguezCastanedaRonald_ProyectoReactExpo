/**
 * Pantalla 10 · Análisis semanal.
 * GET /api/reportes/semanal/?fecha= devuelve los totales, la eficiencia, el detalle
 * por día y un consejo. Las flechas permiten ver semanas anteriores.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { Anillo, Cargando, MensajeError, Pantalla, Tarjeta } from '../components';
import { useDatos } from '../hooks';
import { reportes } from '../services';
import { colores, fuentes } from '../theme';
import { aISO, fechaCorta, fechaLocal, formatearMinutos } from '../utils';

const DIAS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

function Grafica({ dias, ancho }) {
  const alto = 150;
  const base = 128;
  const maxMin = Math.max(60, ...dias.map((d) => Math.max(d.estudio, d.pantalla)));
  const horasMax = Math.ceil(maxMin / 60);
  const escala = (base - 14) / (horasMax * 60);
  const columna = (ancho - 24) / 7;
  const barra = Math.min(13, columna / 3);
  return (
    <Svg width={ancho} height={alto}>
      {Array.from({ length: horasMax + 1 }, (_, h) => h).filter((h) => h > 0).map((h) => (
        <Line key={h} x1={24} x2={ancho} y1={base - h * 60 * escala} y2={base - h * 60 * escala} stroke="#EFE6D4" />
      ))}
      {Array.from({ length: horasMax }, (_, h) => h + 1).map((h) => (
        <SvgText key={h} x={0} y={base - h * 60 * escala + 4} fontSize={10} fontFamily={fuentes.regular} fill="#9AA39E">{`${h}h`}</SvgText>
      ))}
      {dias.map((d, i) => {
        const x = 24 + i * columna + columna / 2;
        const hE = d.estudio * escala;
        const hP = d.pantalla * escala;
        return (
          <G key={d.fecha}>
            <Rect x={x - barra - 1} y={base - hE} width={barra} height={hE} rx={3} fill={colores.verde} />
            <Rect x={x + 1} y={base - hP} width={barra} height={hP} rx={3} fill={colores.coral} />
            <SvgText x={x} y={alto - 4} fontSize={11} fontFamily={fuentes.media} fill="#6F7A74" textAnchor="middle">{DIAS[i]}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function AnalisisScreen() {
  const [fecha, setFecha] = useState(null);
  const [ancho, setAncho] = useState(300);
  const { datos, error, cargando, recargar, recargando } = useDatos(() => reportes.semanal(fecha), [fecha]);

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const mover = (dias) => {
    const f = fechaLocal(datos.semana_inicio);
    f.setDate(f.getDate() + dias);
    setFecha(aISO(f));
  };
  const esActual = new Date() <= fechaLocal(datos.semana_fin).setHours(23, 59);
  const eficiencia = Number(datos.promedio_eficiencia);
  const cambio = datos.cambio_eficiencia;

  return (
    <Pantalla alRecargar={recargar} recargando={recargando}>
      <View style={estilos.encabezado}>
        <Pressable onPress={() => mover(-7)} style={estilos.flecha} accessibilityLabel="Semana anterior"><Feather name="chevron-left" size={20} color={colores.texto} /></Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={estilos.rango}>{fechaCorta(datos.semana_inicio)} – {fechaCorta(datos.semana_fin)}</Text>
          <Text style={estilos.titulo}>Análisis semanal</Text>
        </View>
        <Pressable onPress={() => !esActual && mover(7)} style={[estilos.flecha, esActual && { opacity: 0.3 }]} accessibilityLabel="Semana siguiente"><Feather name="chevron-right" size={20} color={colores.texto} /></Pressable>
      </View>

      <Tarjeta oscura estilo={estilos.eficiencia}>
        <Anillo tamano={86} grosor={9} progreso={eficiencia / 100} color={colores.lima} fondo="rgba(255,255,255,0.15)">
          <Text style={estilos.porcentaje}>{Math.round(eficiencia)}%</Text>
        </Anillo>
        <View style={{ flex: 1 }}>
          <Text style={estilos.efTitulo}>Eficiencia de la semana</Text>
          <Text style={estilos.efTexto}>
            {cambio == null ? 'Sin datos de la semana anterior' : (
              <><Text style={{ color: cambio >= 0 ? colores.lima : '#FFB49C', fontFamily: fuentes.seminegrita }}>{cambio >= 0 ? '▲' : '▼'} {Math.abs(cambio)}%</Text> contra la semana pasada</>
            )}
          </Text>
        </View>
      </Tarjeta>

      <View style={estilos.totales}>
        <Tarjeta estilo={{ flex: 1 }}><Text style={estilos.totEtiqueta}>Total estudio</Text><Text style={estilos.totValor}>{formatearMinutos(datos.total_estudio)}</Text></Tarjeta>
        <Tarjeta estilo={{ flex: 1 }}><Text style={estilos.totEtiqueta}>Total celular</Text><Text style={[estilos.totValor, { color: colores.coral }]}>{formatearMinutos(datos.total_pantalla)}</Text></Tarjeta>
      </View>

      <Tarjeta estilo={{ marginTop: 12 }}>
        <Text style={estilos.graficaTitulo}>Estudio vs. celular por día</Text>
        <View style={estilos.leyenda}>
          <View style={estilos.leyendaItem}><View style={[estilos.cuadro, { backgroundColor: colores.verde }]} /><Text style={estilos.leyendaTexto}>Estudio</Text></View>
          <View style={estilos.leyendaItem}><View style={[estilos.cuadro, { backgroundColor: colores.coral }]} /><Text style={estilos.leyendaTexto}>Celular</Text></View>
        </View>
        <View
          onLayout={(e) => {
            // Cuando la pestaña está oculta el ancho llega en 0; se ignora para no dibujar barras negativas
            const w = e.nativeEvent.layout.width;
            if (w > 0) setAncho(w);
          }}
        >
          <Grafica dias={datos.dias} ancho={ancho} />
        </View>
      </Tarjeta>

      <View style={estilos.consejo}>
        <Text style={estilos.consejoTexto}><Text style={{ fontFamily: fuentes.seminegrita }}>Consejo: </Text>{datos.consejo}</Text>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 18 },
  flecha: { width: 40, height: 40, borderRadius: 12, backgroundColor: colores.blanco, borderWidth: 1, borderColor: colores.borde, alignItems: 'center', justifyContent: 'center' },
  rango: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 20, color: colores.texto },
  eficiencia: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  porcentaje: { fontFamily: fuentes.seminegrita, fontSize: 19, color: colores.crema },
  efTitulo: { fontFamily: fuentes.regular, fontSize: 13, color: colores.crema, opacity: 0.8 },
  efTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.crema, marginTop: 4 },
  totales: { flexDirection: 'row', gap: 10, marginTop: 12 },
  totEtiqueta: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  totValor: { fontFamily: fuentes.seminegrita, fontSize: 22, color: colores.texto },
  graficaTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
  leyenda: { flexDirection: 'row', gap: 14, marginTop: 6, marginBottom: 10 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cuadro: { width: 10, height: 10, borderRadius: 3 },
  leyendaTexto: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  consejo: { backgroundColor: colores.lima, borderRadius: 14, padding: 14, marginTop: 12 },
  consejoTexto: { fontFamily: fuentes.regular, fontSize: 13, color: colores.verde },
});
