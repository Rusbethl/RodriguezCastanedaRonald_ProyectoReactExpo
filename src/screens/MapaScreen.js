/**
 * Mapa de estudio.
 * Muestra en un mapa interactivo dónde está el usuario ahora mismo. Sirve para ubicar el
 * lugar desde donde estudia; además se puede tocar el mapa para marcar otro punto (la
 * biblioteca, la escuela) y ver a cuántos metros queda.
 *
 * La ubicación la maneja el hook useUbicacion; el dibujo del mapa, el componente MapaVista.
 * Esta pantalla solo decide qué mostrar según el estado: buscando, listo, sin permiso...
 */
import { useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Boton, Cargando, Encabezado, MapaVista, Pantalla, Tarjeta } from '../components';
import { useUbicacion } from '../hooks';
import { colores, fuentes, radios } from '../theme';
import { distanciaMetros, formatearDistancia } from '../utils';

const MENSAJES = {
  denegado: {
    titulo: 'Falta el permiso de ubicación',
    texto: 'Para mostrarte en el mapa necesito tu permiso. Puedes darlo en los ajustes del celular y volver a intentar.',
  },
  sin_gps: {
    titulo: 'La ubicación está apagada',
    texto: 'Activa la ubicación (GPS) del celular y vuelve a intentar.',
  },
};

export default function MapaScreen() {
  const { estado, posicion, mensaje, buscar } = useUbicacion();
  const [punto, setPunto] = useState(null);
  const mapa = useRef(null);

  const hayMapa = posicion && estado !== 'denegado' && estado !== 'sin_gps';
  const problema = MENSAJES[estado] ?? (estado === 'error' ? { titulo: 'No se pudo obtener la ubicación', texto: mensaje } : null);

  return (
    <Pantalla scroll={false}>
      <Encabezado titulo="Mapa de estudio" />

      <View style={estilos.marco}>
        {hayMapa ? (
          <MapaVista ref={mapa} coordenadas={posicion} precision={posicion.precision} punto={punto} alTocar={setPunto} />
        ) : problema ? (
          <View style={estilos.centro}>
            <Text style={estilos.problemaTitulo}>{problema.titulo}</Text>
            <Text style={estilos.problemaTexto}>{problema.texto}</Text>
            {estado === 'denegado' && Platform.OS !== 'web' && (
              <Boton titulo="Abrir ajustes" variante="contorno" onPress={() => Linking.openSettings()} estilo={{ alignSelf: 'stretch' }} />
            )}
          </View>
        ) : (
          <View style={estilos.centro}>
            <Cargando />
            <Text style={estilos.problemaTexto}>Buscando tu ubicación…</Text>
          </View>
        )}
        {hayMapa && estado === 'buscando' && (
          <View style={estilos.actualizando}>
            <Text style={estilos.actualizandoTexto}>Actualizando…</Text>
          </View>
        )}
      </View>

      {posicion && (
        <Tarjeta estilo={{ marginTop: 14 }}>
          <Fila etiqueta="Latitud" valor={posicion.latitude.toFixed(5)} />
          <Fila etiqueta="Longitud" valor={posicion.longitude.toFixed(5)} />
          <Fila etiqueta="Precisión" valor={`± ${Math.round(posicion.precision ?? 0)} m`} />
          <Fila
            etiqueta="Actualizada"
            valor={posicion.hora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            ultima={!punto}
          />
          {punto && <Fila etiqueta="Punto marcado" valor={`a ${formatearDistancia(distanciaMetros(posicion, punto))}`} ultima />}
        </Tarjeta>
      )}

      {hayMapa && Platform.OS !== 'web' && !punto && (
        <Text style={estilos.ayuda}>Toca el mapa para marcar un punto y ver a cuántos metros queda.</Text>
      )}

      <View style={estilos.botones}>
        {hayMapa && (
          <Boton titulo="Centrar" icono="crosshair" variante="contorno" onPress={() => mapa.current?.centrar()} estilo={{ flex: 1 }} />
        )}
        {punto && <Boton titulo="Quitar punto" icono="x" variante="contorno" onPress={() => setPunto(null)} estilo={{ flex: 1 }} />}
        <Boton
          titulo={posicion ? 'Actualizar' : 'Reintentar'}
          icono="refresh-cw"
          onPress={buscar}
          cargando={estado === 'buscando' && !!posicion}
          estilo={{ flex: 1 }}
        />
      </View>
    </Pantalla>
  );
}

function Fila({ etiqueta, valor, ultima = false }) {
  return (
    <View style={[estilos.fila, !ultima && estilos.separador]}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: {
    flex: 1,
    minHeight: 240,
    borderRadius: radios.tarjeta,
    overflow: 'hidden',
    backgroundColor: colores.cremaOscuro,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  problemaTitulo: { fontFamily: fuentes.seminegrita, fontSize: 16, color: colores.texto, textAlign: 'center' },
  problemaTexto: { fontFamily: fuentes.regular, fontSize: 14, lineHeight: 20, color: colores.textoSecundario, textAlign: 'center' },
  actualizando: { position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: colores.verde, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  actualizandoTexto: { fontFamily: fuentes.media, fontSize: 12, color: colores.crema },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  separador: { borderBottomWidth: 1, borderBottomColor: colores.borde },
  etiqueta: { fontFamily: fuentes.regular, fontSize: 13.5, color: colores.textoSecundario },
  valor: { fontFamily: fuentes.seminegrita, fontSize: 13.5, color: colores.texto },
  ayuda: { fontFamily: fuentes.regular, fontSize: 12.5, color: colores.textoSecundario, textAlign: 'center', marginTop: 10 },
  botones: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
