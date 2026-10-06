/**
 * Pantalla 13 · Logros y racha.
 * GET /api/racha/ (días seguidos, récord y semana) y GET /api/logros/ (obtenidos y
 * pendientes con su progreso).
 */
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { BarraProgreso, Cargando, Encabezado, MensajeError, Pantalla, Tarjeta } from '../components';
import { useDatos } from '../hooks';
import { logros as logrosApi } from '../services';
import { colores, fuentes } from '../theme';
import { fechaCorta } from '../utils';

// Íconos del catálogo de logros traducidos a Feather (el set de íconos de la app)
const ICONOS = { sprout: 'feather', 'phone-off': 'phone-off', flame: 'zap', timer: 'clock', trophy: 'award', gem: 'star', medal: 'shield' };
const DIAS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

export default function LogrosScreen() {
  const { datos, error, cargando, recargar } = useDatos(async () => {
    const [racha, logros] = await Promise.all([logrosApi.racha(), logrosApi.listar()]);
    return { racha, logros };
  });

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const { racha, logros } = datos;
  const obtenidos = logros.filter((l) => l.obtenido);
  const pendientes = logros.filter((l) => !l.obtenido);

  return (
    <Pantalla>
      <Encabezado titulo="Logros" />
      <Tarjeta oscura>
        <View style={estilos.racha}>
          <View style={estilos.rachaIcono}><Feather name="zap" size={26} color={colores.verde} /></View>
          <View>
            <Text style={estilos.rachaDias}>{racha.dias_consecutivos} {racha.dias_consecutivos === 1 ? 'día' : 'días'}</Text>
            <Text style={estilos.rachaTexto}>de racha seguida · récord: {racha.record}</Text>
          </View>
        </View>
        <View style={estilos.semana}>
          {racha.semana.map((d, i) => (
            <View key={d.fecha} style={{ flex: 1, alignItems: 'center' }}>
              <View style={[estilos.diaCaja, d.estudio ? estilos.diaHecho : estilos.diaPendiente]} />
              <Text style={estilos.diaLetra}>{DIAS[i]}</Text>
            </View>
          ))}
        </View>
      </Tarjeta>

      <Text style={estilos.seccion}>Obtenidos ({obtenidos.length})</Text>
      <View style={estilos.cuadricula}>
        {obtenidos.map((l) => (
          <Tarjeta key={l.id} estilo={estilos.logro}>
            <View style={estilos.logroIcono}><Feather name={ICONOS[l.icono] ?? 'award'} size={20} color={colores.verde} /></View>
            <Text style={estilos.logroNombre}>{l.nombre_logro}</Text>
            <Text style={estilos.logroTexto}>{l.descripcion}</Text>
            <Text style={estilos.logroFecha}>{fechaCorta(l.fecha_obtenido.slice(0, 10))}</Text>
          </Tarjeta>
        ))}
      </View>
      {obtenidos.length === 0 && <Text style={estilos.vacio}>Completa tu primera sesión para ganar tu primer logro.</Text>}

      <Text style={estilos.seccion}>Por desbloquear</Text>
      <Tarjeta estilo={{ paddingVertical: 4 }}>
        {pendientes.map((l, i) => (
          <View key={l.id} style={[estilos.pendiente, i < pendientes.length - 1 && estilos.separador]}>
            <View style={[estilos.logroIcono, { backgroundColor: colores.cremaOscuro }]}><Feather name="lock" size={16} color={colores.textoSecundario} /></View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.pendNombre}>{l.nombre_logro}</Text>
              <Text style={estilos.logroTexto}>{l.descripcion}</Text>
              {l.progreso_requerido > 1 && (
                <View style={estilos.progreso}>
                  <BarraProgreso valor={(l.progreso_actual * 100) / l.progreso_requerido} alto={5} estilo={{ flex: 1 }} />
                  <Text style={estilos.progresoTexto}>{l.progreso_actual}/{l.progreso_requerido}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  racha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rachaIcono: { width: 52, height: 52, borderRadius: 16, backgroundColor: colores.lima, alignItems: 'center', justifyContent: 'center' },
  rachaDias: { fontFamily: fuentes.seminegrita, fontSize: 28, color: colores.crema, lineHeight: 34 },
  rachaTexto: { fontFamily: fuentes.regular, fontSize: 13, color: colores.crema, opacity: 0.8 },
  semana: { flexDirection: 'row', gap: 6, marginTop: 16 },
  diaCaja: { height: 30, alignSelf: 'stretch', borderRadius: 9 },
  diaHecho: { backgroundColor: colores.lima },
  diaPendiente: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,246,232,0.4)' },
  diaLetra: { fontFamily: fuentes.regular, fontSize: 11, color: colores.crema, marginTop: 4 },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 20, marginBottom: 10 },
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  logro: { width: '48%', flexGrow: 1, padding: 12 },
  logroIcono: { width: 38, height: 38, borderRadius: 12, backgroundColor: colores.lima, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logroNombre: { fontFamily: fuentes.seminegrita, fontSize: 13.5, color: colores.texto },
  logroTexto: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  logroFecha: { fontFamily: fuentes.media, fontSize: 11.5, color: colores.verde, marginTop: 4 },
  vacio: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  pendiente: { flexDirection: 'row', gap: 12, paddingVertical: 12, alignItems: 'flex-start' },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  pendNombre: { fontFamily: fuentes.media, fontSize: 14, color: colores.texto },
  progreso: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  progresoTexto: { fontFamily: fuentes.media, fontSize: 12, color: colores.textoSecundario },
});
