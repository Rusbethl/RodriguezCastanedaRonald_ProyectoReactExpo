/**
 * Pantalla 7 · Sesión terminada.
 * Muestra el resumen, pide el nivel de concentración (catálogo NivelEnfoque) y las
 * apps que se usaron (catálogo AppDistractora), y guarda todo en
 * POST /api/sesiones/{id}/finalizar/. El backend actualiza racha, metas y logros.
 */
import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, Cargando, Chip, Encabezado, MensajeError, Pantalla, Tarjeta } from '../components';
import { useDatos, useSonido } from '../hooks';
import { useNotificaciones } from '../notificaciones';
import { catalogos, sesiones } from '../services';
import { colores, fuentes, sonidos } from '../theme';
import { porcentajePantalla } from '../utils';

const CARAS = { Baja: 'frown', Media: 'meh', Alta: 'smile' };

export default function SesionTerminadaScreen({ navigation, route }) {
  const { sesion, duracionEstudio, desbloqueos } = route.params;
  const [tiempoPantalla, setTiempoPantalla] = useState(Math.min(route.params.tiempoPantalla, duracionEstudio));
  const { datos, error, cargando, recargar } = useDatos(async () => {
    const [niveles, apps] = await Promise.all([catalogos.nivelesEnfoque(), catalogos.appsDistractoras()]);
    return { niveles, apps };
  });
  const [nivel, setNivel] = useState(null);
  const [apps, setApps] = useState({}); // { idApp: minutos }
  const [verTodas, setVerTodas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [aviso, setAviso] = useState('');
  const { avisar, notificar } = useNotificaciones();
  const sonarGuardada = useSonido(sonidos.sesionGuardada);
  const sonarLogro = useSonido(sonidos.logro);
  const anunciado = useRef(false);

  const pct = porcentajePantalla(duracionEstudio, tiempoPantalla);
  const appsVisibles = useMemo(() => {
    if (!datos) return [];
    const populares = ['Instagram', 'WhatsApp', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)'];
    return verTodas ? datos.apps : datos.apps.filter((a) => populares.includes(a.nombre_app) || apps[a.id] != null);
  }, [datos, verTodas, apps]);

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const alternarApp = (id) => {
    const copia = { ...apps };
    if (copia[id] != null) delete copia[id];
    else copia[id] = 1;
    setApps(copia);
  };
  const ajustar = (id, delta) => setApps({ ...apps, [id]: Math.max(1, apps[id] + delta) });
  const ajustarPantalla = (delta) => setTiempoPantalla(Math.max(0, Math.min(duracionEstudio, tiempoPantalla + delta)));

  // Avisos en orden: sesión guardada, logros, metas y alertas del servidor
  const anunciar = (respuesta) => {
    const r = respuesta.resultado;
    if (anunciado.current) return;
    anunciado.current = true;
    (r.logros_nuevos.length ? sonarLogro : sonarGuardada)();
    avisar({ tipo: 'exito', titulo: 'Sesión guardada', mensaje: `Se registraron ${respuesta.duracion_estudio ?? duracionEstudio} min de estudio.` });
    r.logros_nuevos.forEach((l) => notificar({ tipo: 'logro', titulo: '¡Nuevo logro!', mensaje: `Desbloqueaste "${l}".` }));
    r.metas_cumplidas.forEach((m) => notificar({ tipo: 'logro', titulo: 'Meta cumplida', mensaje: m }));
    r.alertas.forEach((a) => notificar({ tipo: 'alerta', titulo: 'Alerta de distracción', mensaje: a }));
  };

  const guardar = async () => {
    if (!nivel) return setAviso('Elige cómo sentiste tu concentración.');
    setGuardando(true);
    setAviso('');
    try {
      const respuesta = await sesiones.finalizar(sesion.id, {
        duracion_estudio: duracionEstudio,
        tiempo_pantalla: tiempoPantalla,
        desbloqueos,
        nivel_enfoque: nivel,
        apps: Object.entries(apps).map(([app, minutos_uso]) => ({ app: Number(app), minutos_uso })),
      });
      setResultado(respuesta.resultado);
      anunciar(respuesta);
    } catch (e) {
      setAviso(e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (resultado) {
    return (
      <Pantalla>
        <View style={estilos.listo}>
          <View style={estilos.listoIcono}><Feather name="check" size={36} color={colores.verde} /></View>
          <Text style={estilos.listoTitulo}>¡Sesión guardada!</Text>
          <Text style={estilos.listoTexto}>Llevas {resultado.racha} {resultado.racha === 1 ? 'día' : 'días'} de racha.</Text>
        </View>
        {resultado.logros_nuevos.map((l) => (
          <Tarjeta key={l} estilo={[estilos.resultado, { borderLeftColor: colores.verde }]}>
            <Text style={estilos.resultadoTitulo}>Nuevo logro: {l}</Text>
          </Tarjeta>
        ))}
        {resultado.metas_cumplidas.map((m) => (
          <Tarjeta key={m} estilo={[estilos.resultado, { borderLeftColor: colores.verde }]}>
            <Text style={estilos.resultadoTitulo}>Meta cumplida: {m}</Text>
          </Tarjeta>
        ))}
        {resultado.alertas.map((a) => (
          <Tarjeta key={a} estilo={[estilos.resultado, { borderLeftColor: colores.coral }]}>
            <Text style={estilos.resultadoTexto}>{a}</Text>
          </Tarjeta>
        ))}
        <Boton titulo="Volver al inicio" onPress={() => navigation.popToTop()} estilo={{ marginTop: 18 }} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Encabezado titulo="Sesión terminada" regresar={false} />
      <View style={estilos.resumen}>
        <Tarjeta estilo={estilos.dato}><Text style={estilos.datoValor}>{duracionEstudio} min</Text><Text style={estilos.datoEtiqueta}>Estudio</Text></Tarjeta>
        <Tarjeta estilo={estilos.dato}><Text style={[estilos.datoValor, { color: colores.coral }]}>{tiempoPantalla} min</Text><Text style={estilos.datoEtiqueta}>Celular</Text></Tarjeta>
        <Tarjeta estilo={estilos.dato}><Text style={estilos.datoValor}>{desbloqueos}</Text><Text style={estilos.datoEtiqueta}>Salidas</Text></Tarjeta>
      </View>

      <Text style={estilos.seccion}>¿Cómo sentiste tu concentración?</Text>
      <View style={estilos.niveles}>
        {datos.niveles.map((n) => {
          const activo = nivel === n.id;
          return (
            <Pressable key={n.id} onPress={() => setNivel(n.id)} style={[estilos.nivel, activo && estilos.nivelActivo]}>
              <Feather name={CARAS[n.nombre_nivel] ?? 'circle'} size={28} color={activo ? colores.verde : colores.textoSecundario} />
              <Text style={[estilos.nivelTexto, activo && { color: colores.verde, fontFamily: fuentes.seminegrita }]}>{n.nombre_nivel}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={estilos.seccion}>Tiempo real en el celular</Text>
      <Tarjeta estilo={estilos.ajuste}>
        <Text style={estilos.ajusteTexto}>Corrige si usaste el celular sin salir de la app</Text>
        <View style={estilos.stepper}>
          <Pressable onPress={() => ajustarPantalla(-1)} style={estilos.paso}><Feather name="minus" size={16} color={colores.texto} /></Pressable>
          <Text style={estilos.pasoValor}>{tiempoPantalla}</Text>
          <Pressable onPress={() => ajustarPantalla(1)} style={estilos.paso}><Feather name="plus" size={16} color={colores.texto} /></Pressable>
        </View>
      </Tarjeta>

      <Text style={estilos.seccion}>¿Qué apps usaste?</Text>
      <View style={estilos.chips}>
        {appsVisibles.map((a) => (
          <Chip key={a.id} texto={a.nombre_app} activo={apps[a.id] != null} onPress={() => alternarApp(a.id)} />
        ))}
        <Chip texto={verTodas ? 'Ver menos' : 'Ver todas'} onPress={() => setVerTodas(!verTodas)} />
      </View>
      {Object.keys(apps).length > 0 && (
        <Tarjeta estilo={{ paddingVertical: 4, marginTop: 10 }}>
          {Object.entries(apps).map(([id, minutos]) => {
            const app = datos.apps.find((a) => a.id === Number(id));
            return (
              <View key={id} style={estilos.appFila}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.appNombre}>{app.nombre_app}</Text>
                  <Text style={estilos.appCategoria}>{app.categoria_nombre}</Text>
                </View>
                <View style={estilos.stepper}>
                  <Pressable onPress={() => ajustar(id, -1)} style={estilos.paso}><Feather name="minus" size={16} color={colores.texto} /></Pressable>
                  <Text style={estilos.pasoValor}>{minutos} min</Text>
                  <Pressable onPress={() => ajustar(id, 1)} style={estilos.paso}><Feather name="plus" size={16} color={colores.texto} /></Pressable>
                </View>
              </View>
            );
          })}
        </Tarjeta>
      )}

      <View style={estilos.porcentaje}>
        <Text style={estilos.porcentajeTexto}>
          El celular ocupó el <Text style={{ fontFamily: fuentes.seminegrita }}>{pct}%</Text> de tu sesión.
        </Text>
      </View>
      {aviso ? <Text style={estilos.error}>{aviso}</Text> : null}
      <Boton titulo="Guardar sesión" onPress={guardar} cargando={guardando} />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  resumen: { flexDirection: 'row', gap: 10 },
  dato: { flex: 1, alignItems: 'center', padding: 12 },
  datoValor: { fontFamily: fuentes.seminegrita, fontSize: 20, color: colores.texto },
  datoEtiqueta: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 20, marginBottom: 10 },
  niveles: { flexDirection: 'row', gap: 10 },
  nivel: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco },
  nivelActivo: { backgroundColor: colores.lima, borderColor: colores.verde },
  nivelTexto: { fontFamily: fuentes.regular, fontSize: 13, color: colores.texto },
  ajuste: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ajusteTexto: { flex: 1, fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  appFila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colores.borde },
  appNombre: { fontFamily: fuentes.media, fontSize: 14, color: colores.texto },
  appCategoria: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paso: { width: 30, height: 30, borderRadius: 10, backgroundColor: colores.cremaOscuro, alignItems: 'center', justifyContent: 'center' },
  pasoValor: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto, minWidth: 44, textAlign: 'center' },
  porcentaje: { backgroundColor: colores.coralSuave, borderRadius: 14, padding: 12, marginTop: 16, marginBottom: 14 },
  porcentajeTexto: { fontFamily: fuentes.regular, fontSize: 13, color: '#A2401F' },
  error: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.coral, marginBottom: 10, textAlign: 'center' },
  listo: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  listoIcono: { width: 80, height: 80, borderRadius: 40, backgroundColor: colores.lima, alignItems: 'center', justifyContent: 'center' },
  listoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 24, color: colores.texto, marginTop: 14 },
  listoTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario, marginTop: 4 },
  resultado: { marginBottom: 10, borderLeftWidth: 4 },
  resultadoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
  resultadoTexto: { fontFamily: fuentes.regular, fontSize: 13.5, color: colores.texto },
});
