/**
 * Pantalla 4 · Configuración.
 * Tema, notificaciones y umbral de alerta (GET/PATCH /api/configuracion/), lista de
 * dispositivos (/api/dispositivos/) y cerrar sesión.
 */
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Cargando, Encabezado, MensajeError, Pantalla, Tarjeta } from '../components';
import { useAuth } from '../context';
import { useDatos } from '../hooks';
import { configuracion as configApi, dispositivos as dispApi } from '../services';
import { colores, fuentes } from '../theme';

const TEMAS = [
  { valor: 'claro', texto: 'Claro' },
  { valor: 'oscuro', texto: 'Oscuro' },
  { valor: 'sistema', texto: 'Sistema' },
];
const UMBRALES = [10, 15, 20, 25, 30, 40, 50];
const ICONO_DISPOSITIVO = { celular: 'smartphone', tablet: 'tablet', laptop: 'monitor', computadora: 'monitor' };

export default function ConfiguracionScreen() {
  const { cerrarSesion } = useAuth();
  const { datos, setDatos, error, cargando, recargar } = useDatos(async () => {
    const [config, dispositivos] = await Promise.all([configApi.obtener(), dispApi.listar()]);
    return { config, dispositivos };
  });

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const { config, dispositivos } = datos;
  const actualizar = async (cambios) => {
    setDatos({ ...datos, config: { ...config, ...cambios } }); // respuesta inmediata en pantalla
    const guardada = await configApi.actualizar(cambios);
    setDatos((d) => ({ ...d, config: guardada }));
  };

  const registrarEste = async () => {
    const nuevo = await dispApi.crear({
      tipo_dispositivo: Platform.OS === 'web' ? 'computadora' : 'celular',
      sistema_operativo: `${Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} ${Platform.Version ?? ''}`.trim(),
      modelo: Platform.OS === 'web' ? 'Navegador' : (Platform.constants?.Model ?? 'Mi celular'),
    });
    setDatos({ ...datos, dispositivos: [...dispositivos, nuevo] });
  };
  const quitar = async (id) => {
    await dispApi.eliminar(id);
    setDatos({ ...datos, dispositivos: dispositivos.filter((d) => d.id !== id) });
  };

  return (
    <Pantalla>
      <Encabezado titulo="Configuración" />

      <Text style={[estilos.seccion, { marginTop: 0 }]}>Apariencia</Text>
      <Tarjeta estilo={estilos.segmentos}>
        {TEMAS.map((t) => (
          <Pressable key={t.valor} onPress={() => actualizar({ tema_visual: t.valor })} style={[estilos.segmento, config.tema_visual === t.valor && estilos.segmentoActivo]}>
            <Text style={[estilos.segmentoTexto, config.tema_visual === t.valor && { color: colores.crema }]}>{t.texto}</Text>
          </Pressable>
        ))}
      </Tarjeta>

      <Text style={estilos.seccion}>Notificaciones y alertas</Text>
      <Tarjeta estilo={{ paddingVertical: 4 }}>
        <View style={[estilos.fila, estilos.separador]}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.titulo}>Notificaciones activas</Text>
            <Text style={estilos.detalle}>Recordatorios, logros y alertas</Text>
          </View>
          <Switch value={config.notificaciones_activas} onValueChange={(v) => actualizar({ notificaciones_activas: v })} trackColor={{ true: colores.verde, false: '#CFD5D1' }} thumbColor={colores.blanco} />
        </View>
        <View style={{ paddingVertical: 14 }}>
          <View style={estilos.fila}>
            <Text style={[estilos.titulo, { flex: 1 }]}>Umbral de alerta</Text>
            <Text style={estilos.umbral}>{config.umbral_alerta_pct}%</Text>
          </View>
          <Text style={estilos.detalle}>Aviso cuando el celular pase este % del tiempo de estudio</Text>
          <View style={estilos.umbrales}>
            {UMBRALES.map((u) => (
              <Pressable key={u} onPress={() => actualizar({ umbral_alerta_pct: u })} style={[estilos.opcionUmbral, config.umbral_alerta_pct === u && estilos.opcionUmbralActiva]}>
                <Text style={[estilos.opcionUmbralTexto, config.umbral_alerta_pct === u && { color: colores.blanco }]}>{u}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Tarjeta>

      <Text style={estilos.seccion}>Mis dispositivos</Text>
      <Tarjeta estilo={{ paddingVertical: 4 }}>
        {dispositivos.map((d) => (
          <View key={d.id} style={[estilos.fila, estilos.separador]}>
            <Feather name={ICONO_DISPOSITIVO[d.tipo_dispositivo] ?? 'smartphone'} size={21} color={colores.verde} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>{d.modelo}</Text>
              <Text style={estilos.detalle}>{d.sistema_operativo}</Text>
            </View>
            <Pressable onPress={() => quitar(d.id)} hitSlop={8} accessibilityLabel={`Quitar ${d.modelo}`}><Feather name="x" size={18} color={colores.textoSecundario} /></Pressable>
          </View>
        ))}
        <Pressable onPress={registrarEste} style={estilos.fila}>
          <Feather name="plus-circle" size={21} color={colores.verde} />
          <Text style={[estilos.titulo, { color: colores.verde }]}>Registrar este dispositivo</Text>
        </Pressable>
      </Tarjeta>

      <Pressable onPress={cerrarSesion} style={estilos.salir}>
        <Text style={estilos.salirTexto}>Cerrar sesión</Text>
      </Pressable>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 20, marginBottom: 10 },
  segmentos: { flexDirection: 'row', gap: 8, padding: 6 },
  segmento: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  segmentoActivo: { backgroundColor: colores.verde },
  segmentoTexto: { fontFamily: fuentes.media, fontSize: 13.5, color: colores.textoSecundario },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  titulo: { fontFamily: fuentes.media, fontSize: 14.5, color: colores.texto },
  detalle: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
  umbral: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.coral },
  umbrales: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  opcionUmbral: { minWidth: 38, paddingVertical: 7, borderRadius: 10, backgroundColor: colores.cremaOscuro, alignItems: 'center' },
  opcionUmbralActiva: { backgroundColor: colores.coral },
  opcionUmbralTexto: { fontFamily: fuentes.media, fontSize: 13, color: colores.texto },
  salir: { alignItems: 'center', marginTop: 26, padding: 10 },
  salirTexto: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.coral },
});
