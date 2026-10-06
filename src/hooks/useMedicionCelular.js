/**
 * Mide cuánto tiempo pasa el usuario fuera de FocusSync durante una sesión.
 *
 * Expo Go no permite leer el uso de otras apps (eso requiere el permiso nativo
 * PACKAGE_USAGE_STATS de Android), así que usamos AppState: cada vez que la app
 * pasa a segundo plano cuenta como un uso del celular y se mide cuánto tardó en
 * volver. Es una aproximación honesta del tiempo en pantalla y de los desbloqueos.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export default function useMedicionCelular(activo) {
  const [segundosFuera, setSegundosFuera] = useState(0);
  const [salidas, setSalidas] = useState(0);
  const [fueraAhora, setFueraAhora] = useState(false);
  const salidaEn = useRef(null);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (!activo) return;
      if (estado !== 'active' && salidaEn.current == null) {
        salidaEn.current = Date.now();
        setSalidas((n) => n + 1);
        setFueraAhora(true);
      } else if (estado === 'active' && salidaEn.current != null) {
        const segundos = Math.round((Date.now() - salidaEn.current) / 1000);
        salidaEn.current = null;
        setSegundosFuera((s) => s + segundos);
        setFueraAhora(false);
      }
    });
    return () => suscripcion.remove();
  }, [activo]);

  return { minutosFuera: Math.round(segundosFuera / 60), segundosFuera, salidas, fueraAhora };
}
