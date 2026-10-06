/**
 * Pantalla 11 · Mis metas.
 * Lista las metas vigentes con el avance y el estado que calcula el backend
 * (GET /api/metas/?activas=true) y permite crear (POST) o borrar (DELETE) metas.
 */
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarraProgreso, Boton, Campo, Cargando, Chip, Encabezado, MensajeError, Pantalla, Tarjeta, Vacio } from '../components';
import { useDatos } from '../hooks';
import { metas as metasApi } from '../services';
import { colores, fuentes } from '../theme';
import { aISO, fechaCorta } from '../utils';

const TIPOS = [
  { valor: 'horas_estudio', texto: 'Horas de estudio', unidad: 'horas' },
  { valor: 'sesiones', texto: 'Sesiones', unidad: 'sesiones' },
  { valor: 'limite_pantalla', texto: 'Límite de celular', unidad: '% máximo' },
];
const ESTADOS = {
  cumplida: { texto: 'Cumplida', color: '#1C8B45' },
  cumpliendo: { texto: 'Vas bien', color: '#1C8B45' },
  en_riesgo: { texto: 'En riesgo', color: colores.coral },
  no_cumplida: { texto: 'No cumplida', color: colores.textoSecundario },
};

function semanaActual() {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { inicio: aISO(lunes), fin: aISO(domingo) };
}

export default function MetasScreen() {
  const { datos, setDatos, error, cargando, recargar } = useDatos(() => metasApi.listar());
  const semana = semanaActual();
  const [form, setForm] = useState({ tipo_meta: 'horas_estudio', valor_objetivo: '', fecha_inicio: semana.inicio, fecha_fin: semana.fin });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const tipo = TIPOS.find((t) => t.valor === form.tipo_meta);
  const cambiar = (campo) => (valor) => {
    setForm({ ...form, [campo]: valor });
    // El error de un campo desaparece en cuanto el usuario lo corrige
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };

  const crear = async () => {
    setGuardando(true);
    setErrores({});
    try {
      await metasApi.crear({ ...form, valor_objetivo: form.valor_objetivo.replace(',', '.') });
      setForm({ ...form, valor_objetivo: '' });
      setDatos(await metasApi.listar());
    } catch (e) {
      setErrores(Object.keys(e.campos ?? {}).length ? e.campos : { general: [e.message] });
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id) => {
    await metasApi.eliminar(id);
    setDatos(datos.filter((m) => m.id !== id));
  };

  const err = (c) => errores[c]?.[0];

  return (
    <Pantalla>
      <Encabezado titulo="Mis metas" />
      {datos.length === 0 && <Vacio icono="target" mensaje="No tienes metas activas. Crea una abajo." />}
      {datos.map((m) => {
        const estado = ESTADOS[m.estado] ?? ESTADOS.cumpliendo;
        const esLimite = m.tipo_meta === 'limite_pantalla';
        return (
          <Tarjeta key={m.id} estilo={{ marginBottom: 10 }}>
            <View style={estilos.fila}>
              <Text style={[estilos.tipo, esLimite && { backgroundColor: colores.coralSuave, color: '#A2401F' }]}>{m.tipo_meta_nombre}</Text>
              <Text style={estilos.periodo}>{fechaCorta(m.fecha_inicio)} – {fechaCorta(m.fecha_fin)}</Text>
              <Pressable onPress={() => borrar(m.id)} hitSlop={8} accessibilityLabel="Borrar meta"><Feather name="x" size={17} color={colores.textoSecundario} /></Pressable>
            </View>
            <Text style={estilos.objetivo}>
              {esLimite ? `Máximo ${Number(m.valor_objetivo)}% de celular por sesión` : `${Number(m.valor_objetivo)} ${TIPOS.find((t) => t.valor === m.tipo_meta).unidad}`}
            </Text>
            <View style={[estilos.fila, { marginBottom: 8 }]}>
              <Text style={estilos.actual}>{esLimite ? `Promedio actual: ${m.valor_actual}%` : `Llevas ${Number(m.valor_actual)} de ${Number(m.valor_objetivo)}`}</Text>
              <Text style={[estilos.estado, { color: estado.color }]}>{esLimite ? estado.texto : `${estado.texto} · ${m.avance}%`}</Text>
            </View>
            {esLimite ? (
              // Para un límite la barra muestra qué tanto del máximo se ha usado
              <BarraProgreso
                valor={Math.min(100, (Number(m.valor_actual) / Number(m.valor_objetivo)) * 100)}
                color={Number(m.valor_actual) > Number(m.valor_objetivo) ? colores.coral : colores.verde}
              />
            ) : (
              <BarraProgreso valor={m.avance} color={colores.verde} />
            )}
          </Tarjeta>
        );
      })}

      <Text style={estilos.seccion}>Nueva meta</Text>
      <Tarjeta>
        <Text style={estilos.etiqueta}>Tipo de meta</Text>
        <View style={estilos.chips}>
          {TIPOS.map((t) => <Chip key={t.valor} texto={t.texto} activo={form.tipo_meta === t.valor} onPress={() => cambiar('tipo_meta')(t.valor)} />)}
        </View>
        <Campo etiqueta={`Valor objetivo (${tipo.unidad})`} value={form.valor_objetivo} onChangeText={cambiar('valor_objetivo')} keyboardType="decimal-pad" placeholder={form.tipo_meta === 'limite_pantalla' ? '20' : '15'} error={err('valor_objetivo')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Campo estilo={{ flex: 1 }} etiqueta="Inicio" value={form.fecha_inicio} onChangeText={cambiar('fecha_inicio')} error={err('fecha_inicio')} />
          <Campo estilo={{ flex: 1 }} etiqueta="Fin" value={form.fecha_fin} onChangeText={cambiar('fecha_fin')} error={err('fecha_fin')} />
        </View>
        {err('general') && <Text style={estilos.error}>{err('general')}</Text>}
        <Boton titulo="Crear meta" onPress={crear} cargando={guardando} />
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tipo: { fontFamily: fuentes.seminegrita, fontSize: 11, backgroundColor: colores.cremaOscuro, color: colores.texto, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99, overflow: 'hidden' },
  periodo: { flex: 1, textAlign: 'right', fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  objetivo: { fontFamily: fuentes.seminegrita, fontSize: 16, color: colores.texto, marginTop: 10, marginBottom: 2 },
  actual: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  estado: { fontFamily: fuentes.seminegrita, fontSize: 12.5 },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 18, marginBottom: 10 },
  etiqueta: { fontFamily: fuentes.media, fontSize: 12.5, color: colores.textoSecundario, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  error: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.coral, marginBottom: 10 },
});
