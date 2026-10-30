/**
 * Reproduce un sonido corto local (expo-audio).
 * Recibe el archivo (require) y regresa una función que lo reproduce desde el principio.
 * El reproductor se crea al abrir la pantalla y se libera solo al cerrarla.
 */
import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

export default function useSonido(fuente) {
  const reproductor = useAudioPlayer(fuente);

  return useCallback(() => {
    try {
      reproductor.seekTo(0); // para que suene completo aunque ya haya sonado antes
      reproductor.play();
    } catch {
      // si el sonido no carga, la app sigue funcionando sin él
    }
  }, [reproductor]);
}
