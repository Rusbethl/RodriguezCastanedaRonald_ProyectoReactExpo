/**
 * Mapa para el navegador (npm run web).
 *
 * react-native-maps solo existe en Android e iOS, así que en web se incrusta el mapa de
 * OpenStreetMap con un marcador en la ubicación actual. Es un mapa interactivo (se mueve
 * y se acerca), pero no avisa cuando se toca, por eso aquí no existe el "punto marcado".
 */
import { forwardRef, useImperativeHandle, useState } from 'react';

// Grados que se muestran alrededor de la ubicación (más o menos 550 m)
const MARGEN = 0.003;

const MapaVista = forwardRef(function MapaVista({ coordenadas }, ref) {
  // Cambiar la 'key' vuelve a cargar el iframe, que es la forma de "centrar" aquí
  const [version, setVersion] = useState(0);
  useImperativeHandle(ref, () => ({ centrar: () => setVersion((v) => v + 1) }));

  const { latitude: lat, longitude: lon } = coordenadas;
  const bbox = [lon - MARGEN, lat - MARGEN, lon + MARGEN, lat + MARGEN].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <iframe
      key={`${version}-${lat}-${lon}`}
      title="Mapa con tu ubicación"
      src={src}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
    />
  );
});

export default MapaVista;
