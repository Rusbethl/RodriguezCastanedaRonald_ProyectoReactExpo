/**
 * Pide permiso y obtiene la ubicación actual del usuario (expo-location).
 *
 * Regresa:
 *   estado   'buscando' | 'listo' | 'denegado' | 'sin_gps' | 'error'
 *   posicion { latitude, longitude, precision (metros), hora (Date) } o null
 *   mensaje  texto del error cuando estado es 'error'
 *   buscar() vuelve a pedir la ubicación (botón "Actualizar")
 *
 * Solo se pide la ubicación mientras la app está abierta ("when in use"); FocusSync
 * no necesita saber dónde estás con la app cerrada.
 */
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export default function useUbicacion() {
  const [estado, setEstado] = useState('buscando');
  const [posicion, setPosicion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const montado = useRef(true);

  const buscar = useCallback(async () => {
    setEstado('buscando');
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== 'granted') {
        if (montado.current) setEstado('denegado');
        return;
      }
      // En el celular el permiso puede estar dado pero el GPS apagado
      if (Platform.OS !== 'web' && !(await Location.hasServicesEnabledAsync())) {
        if (montado.current) setEstado('sin_gps');
        return;
      }
      const lectura = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!montado.current) return;
      setPosicion({
        latitude: lectura.coords.latitude,
        longitude: lectura.coords.longitude,
        precision: lectura.coords.accuracy,
        hora: new Date(lectura.timestamp),
      });
      setEstado('listo');
    } catch (e) {
      if (!montado.current) return;
      setMensaje(e?.message ?? 'No se pudo obtener la ubicación.');
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    buscar();
    return () => {
      montado.current = false;
    };
  }, [buscar]);

  return { estado, posicion, mensaje, buscar };
}
