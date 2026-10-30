/**
 * Mapa interactivo (versión Android e iOS) con react-native-maps.
 *
 * Se puede mover con un dedo, acercar con dos dedos y girar. Dibuja:
 *  - un marcador verde en la ubicación actual,
 *  - un círculo con la precisión del GPS (radio en metros),
 *  - un marcador coral en el punto que el usuario toca en el mapa (opcional).
 *
 * La versión para navegador está en MapaVista.web.js (react-native-maps no funciona en web).
 * Con 'ref.current.centrar()' la pantalla puede regresar el mapa a la ubicación actual.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { colores } from '../theme';

// 0.005 grados de latitud son más o menos 550 m: se alcanza a ver el barrio completo
const ACERCAMIENTO = 0.005;

const MapaVista = forwardRef(function MapaVista({ coordenadas, precision, punto, alTocar }, ref) {
  const mapa = useRef(null);

  const centrar = () => {
    mapa.current?.animateToRegion(
      { latitude: coordenadas.latitude, longitude: coordenadas.longitude, latitudeDelta: ACERCAMIENTO, longitudeDelta: ACERCAMIENTO },
      600,
    );
  };

  useImperativeHandle(ref, () => ({ centrar }));

  // Cada vez que llega una ubicación nueva, el mapa se mueve hacia ella
  useEffect(centrar, [coordenadas.latitude, coordenadas.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapView
      ref={mapa}
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: coordenadas.latitude, longitude: coordenadas.longitude, latitudeDelta: ACERCAMIENTO, longitudeDelta: ACERCAMIENTO }}
      onPress={(evento) => alTocar?.(evento.nativeEvent.coordinate)}
      showsCompass
      toolbarEnabled={false}
    >
      <Circle
        center={coordenadas}
        radius={Math.max(precision ?? 0, 10)}
        strokeColor="rgba(11,74,59,0.5)"
        fillColor="rgba(11,74,59,0.12)"
      />
      <Marker coordinate={coordenadas} title="Estás aquí" description="Tu ubicación actual" pinColor={colores.verde} />
      {punto && <Marker coordinate={punto} title="Punto marcado" pinColor={colores.coral} />}
    </MapView>
  );
});

export default MapaVista;
