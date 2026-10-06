/**
 * Pide datos a la API y maneja los estados de carga y error.
 * Vuelve a pedirlos cada vez que la pantalla recibe el foco, para que al regresar
 * (por ejemplo, de terminar una sesión) Inicio e Historial ya estén actualizados.
 */
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

export default function useDatos(cargarFn, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const primeraVez = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(cargarFn, dependencias);

  const ejecutar = useCallback(async (manual = false) => {
    if (manual) setRecargando(true);
    else if (primeraVez.current) setCargando(true);
    try {
      setDatos(await cargar());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      primeraVez.current = false;
      setCargando(false);
      setRecargando(false);
    }
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      ejecutar();
    }, [ejecutar]),
  );

  return { datos, setDatos, error, cargando, recargando, recargar: () => ejecutar(true) };
}
