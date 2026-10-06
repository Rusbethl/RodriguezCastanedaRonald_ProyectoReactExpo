/**
 * Pantalla 6 · Sesión activa.
 * Cronómetro de la sesión y medición del celular. El tiempo de estudio se calcula
 * a partir de la hora de inicio que guardó el servidor, así no se pierde aunque
 * la app se cierre. Las pausas se descuentan del tiempo de estudio.
 */
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';

import { Anillo, Boton, Pantalla } from '../components';
import { useMedicionCelular } from '../hooks';
import { colores, fuentes } from '../theme';
import { hora, reloj } from '../utils';

export default function SesionActivaScreen({ navigation, route }) {
  const { sesion, duracion } = route.params;
  const inicio = new Date(sesion.fecha_hora_inicio).getTime();
  const [ahora, setAhora] = useState(Date.now());
  const [pausado, setPausado] = useState(false);
  const pausaDesde = useRef(null);
  const [segundosPausa, setSegundosPausa] = useState(0);
  const avisado = useRef(false);
  const celular = useMedicionCelular(!pausado);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const pausaActual = pausado && pausaDesde.current ? (ahora - pausaDesde.current) / 1000 : 0;
  const transcurrido = (ahora - inicio) / 1000 - segundosPausa - pausaActual;
  const total = duracion ? duracion * 60 : null;

  // Aviso al llegar al tiempo elegido (la sesión no se corta sola: el usuario decide)
  useEffect(() => {
    if (total && transcurrido >= total && !avisado.current) {
      avisado.current = true;
      Vibration.vibrate([0, 400, 200, 400]);
    }
  }, [total, transcurrido]);

  const alternarPausa = () => {
    if (pausado) {
      setSegundosPausa((s) => s + (Date.now() - pausaDesde.current) / 1000);
      pausaDesde.current = null;
    } else {
      pausaDesde.current = Date.now();
    }
    setPausado(!pausado);
  };

  const terminar = () => {
    navigation.replace('SesionTerminada', {
      sesion,
      duracionEstudio: Math.max(1, Math.round(transcurrido / 60)),
      tiempoPantalla: celular.minutosFuera,
      desbloqueos: celular.salidas,
    });
  };

  const fin = total ? new Date(inicio + (total + segundosPausa) * 1000).toISOString() : null;

  return (
    <Pantalla fondo={colores.verde} bordes={['top', 'bottom']}>
      <View style={estilos.chips}>
        <View style={estilos.chip}>
          <View style={[estilos.punto, { backgroundColor: sesion.materia_color }]} />
          <Text style={estilos.chipTexto}>{sesion.materia_nombre}</Text>
        </View>
        <View style={[estilos.chip, { backgroundColor: 'rgba(221,245,138,0.15)' }]}>
          <View style={[estilos.punto, { backgroundColor: pausado ? colores.ambar : colores.lima }]} />
          <Text style={[estilos.chipTexto, { color: colores.lima }]}>{pausado ? 'En pausa' : 'En curso'}</Text>
        </View>
      </View>

      <View style={estilos.reloj}>
        <Anillo tamano={260} grosor={14} progreso={total ? transcurrido / total : (transcurrido % 3600) / 3600} color={colores.lima} fondo="rgba(255,255,255,0.12)">
          <Text style={estilos.tiempo}>{reloj(transcurrido)}</Text>
          <Text style={estilos.deTotal}>{total ? `de ${reloj(total)} min` : 'sesión libre'}</Text>
        </Anillo>
      </View>
      <Text style={estilos.horas}>
        Inicio: {hora(sesion.fecha_hora_inicio)}
        {fin ? ` · Fin estimado: ${hora(fin)}` : ''}
      </Text>

      <View style={estilos.metricas}>
        <View style={estilos.metrica}>
          <Text style={estilos.metricaEtiqueta}>Tiempo en el celular</Text>
          <Text style={[estilos.metricaValor, { color: '#FFB49C' }]}>{celular.minutosFuera} min</Text>
        </View>
        <View style={estilos.metrica}>
          <Text style={estilos.metricaEtiqueta}>Veces que saliste</Text>
          <Text style={estilos.metricaValor}>{celular.salidas}</Text>
        </View>
      </View>

      <View style={estilos.aviso}>
        <Feather name="smartphone" size={18} color="#FFB49C" />
        <Text style={estilos.avisoTexto}>
          {celular.salidas
            ? 'Cada vez que sales de FocusSync se cuenta como uso del celular.'
            : 'Deja el celular a un lado. Si sales de la app, se cuenta como distracción.'}
        </Text>
      </View>

      <View style={estilos.botones}>
        <Boton titulo={pausado ? 'Reanudar' : 'Pausar'} variante="contornoClaro" onPress={alternarPausa} estilo={{ flex: 1 }} />
        <Boton titulo="Terminar sesión" variante="lima" onPress={terminar} estilo={{ flex: 1.4 }} />
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  chips: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99 },
  chipTexto: { fontFamily: fuentes.media, fontSize: 12.5, color: colores.crema },
  punto: { width: 9, height: 9, borderRadius: 5 },
  reloj: { alignItems: 'center', marginTop: 34 },
  tiempo: { fontFamily: fuentes.seminegrita, fontSize: 50, color: colores.crema, letterSpacing: 1 },
  deTotal: { fontFamily: fuentes.regular, fontSize: 13.5, color: colores.crema, opacity: 0.7 },
  horas: { fontFamily: fuentes.regular, fontSize: 13, color: colores.crema, opacity: 0.7, textAlign: 'center', marginTop: 18, marginBottom: 22 },
  metricas: { flexDirection: 'row', gap: 12 },
  metrica: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 },
  metricaEtiqueta: { fontFamily: fuentes.regular, fontSize: 12, color: colores.crema, opacity: 0.7 },
  metricaValor: { fontFamily: fuentes.seminegrita, fontSize: 24, color: colores.crema },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(224,100,63,0.18)', borderRadius: 14, padding: 12, marginTop: 14 },
  avisoTexto: { flex: 1, fontFamily: fuentes.regular, fontSize: 13, color: colores.crema },
  botones: { flexDirection: 'row', gap: 12, marginTop: 26 },
});
