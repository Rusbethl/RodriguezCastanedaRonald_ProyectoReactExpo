/**
 * Pantalla 12 · Notificaciones y alertas.
 * Bandeja de GET /api/notificaciones/ (con filtro de no leídas) y los interruptores
 * de las alertas inteligentes (PATCH /api/alertas/{id}/).
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Cargando, Chip, Encabezado, MensajeError, Pantalla, Tarjeta, Vacio } from '../components';
import { useDatos } from '../hooks';
import { alertas as alertasApi, notificaciones as notifApi } from '../services';
import { colores, fuentes } from '../theme';
import { fechaCorta, hora } from '../utils';

const COLOR_TIPO = { alerta: colores.coral, logro: colores.verde, meta: colores.verde, recordatorio: colores.ambar };
const DESCRIPCION_ALERTA = {
  exceso_pantalla: (u) => `Si el celular pasa el ${u}% de la sesión`,
  desbloqueos: (u) => `Más de ${u} salidas en una sesión`,
  racha_riesgo: (u) => `Si no estudias antes de las ${u}:00`,
};

export default function NotificacionesScreen() {
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const { datos, setDatos, error, cargando, recargar, recargando } = useDatos(async () => {
    const [bandeja, alertas] = await Promise.all([notifApi.listar(soloNoLeidas), alertasApi.listar()]);
    return { bandeja, alertas };
  }, [soloNoLeidas]);

  if (cargando) return <Pantalla><Cargando /></Pantalla>;
  if (error) return <Pantalla><MensajeError mensaje={error} alReintentar={recargar} /></Pantalla>;

  const { bandeja, alertas } = datos;

  const leer = async (n) => {
    if (n.leido) return;
    await notifApi.marcarLeida(n.id);
    setDatos({ ...datos, bandeja: { ...bandeja, no_leidas: bandeja.no_leidas - 1, results: bandeja.results.map((x) => (x.id === n.id ? { ...x, leido: true } : x)) } });
  };
  const leerTodas = async () => {
    await notifApi.marcarTodas();
    setDatos({ ...datos, bandeja: { ...bandeja, no_leidas: 0, results: bandeja.results.map((x) => ({ ...x, leido: true })) } });
  };
  const alternarAlerta = async (a) => {
    const actualizada = await alertasApi.actualizar(a.id, { activa: !a.activa });
    setDatos({ ...datos, alertas: alertas.map((x) => (x.id === a.id ? actualizada : x)) });
  };

  return (
    <Pantalla alRecargar={recargar} recargando={recargando}>
      <Encabezado titulo="Notificaciones" />
      <View style={estilos.filtros}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip texto="Todas" activo={!soloNoLeidas} onPress={() => setSoloNoLeidas(false)} />
          <Chip texto={`No leídas (${bandeja.no_leidas})`} activo={soloNoLeidas} onPress={() => setSoloNoLeidas(true)} />
        </View>
        {bandeja.no_leidas > 0 && (
          <Pressable onPress={leerTodas}><Text style={estilos.marcar}>Marcar leídas</Text></Pressable>
        )}
      </View>

      {bandeja.results.length === 0 && <Vacio icono="bell-off" mensaje="No tienes notificaciones." />}
      {bandeja.results.map((n) => (
        <Tarjeta key={n.id} onPress={() => leer(n)} estilo={[estilos.notif, { borderLeftColor: COLOR_TIPO[n.tipo] }, n.leido && { opacity: 0.6 }]}>
          <View style={estilos.notifFila}>
            <Text style={estilos.notifTitulo}>{n.tipo_nombre}</Text>
            <Text style={estilos.notifFecha}>{fechaCorta(n.fecha_envio.slice(0, 10))} {hora(n.fecha_envio)}</Text>
          </View>
          <Text style={estilos.notifTexto}>{n.mensaje}</Text>
        </Tarjeta>
      ))}

      <Text style={estilos.seccion}>Alertas inteligentes</Text>
      <Tarjeta estilo={{ paddingVertical: 4 }}>
        {alertas.map((a, i) => (
          <View key={a.id} style={[estilos.alerta, i < alertas.length - 1 && estilos.separador]}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.alertaTitulo}>{a.tipo_alerta_nombre}</Text>
              <Text style={estilos.alertaTexto}>{DESCRIPCION_ALERTA[a.tipo_alerta]?.(a.umbral_porcentaje)}</Text>
            </View>
            <Switch value={a.activa} onValueChange={() => alternarAlerta(a)} trackColor={{ true: colores.verde, false: '#CFD5D1' }} thumbColor={colores.blanco} />
          </View>
        ))}
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  filtros: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  marcar: { fontFamily: fuentes.seminegrita, fontSize: 12.5, color: colores.verde },
  notif: { marginBottom: 8, borderLeftWidth: 4 },
  notifFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  notifTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
  notifFecha: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoSecundario },
  notifTexto: { fontFamily: fuentes.regular, fontSize: 13.5, color: colores.texto, marginTop: 4 },
  seccion: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto, marginTop: 18, marginBottom: 10 },
  alerta: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  alertaTitulo: { fontFamily: fuentes.media, fontSize: 14.5, color: colores.texto },
  alertaTexto: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario },
});
