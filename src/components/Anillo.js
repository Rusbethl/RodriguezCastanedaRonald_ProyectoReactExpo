/**
 * Indicador circular de progreso dibujado con SVG.
 * Se usa en el cronómetro de la sesión activa y en la eficiencia semanal.
 */
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function Anillo({ tamano, grosor, progreso, color, fondo, children }) {
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const avance = Math.max(0, Math.min(1, progreso));
  return (
    <View style={{ width: tamano, height: tamano, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={tamano} height={tamano} style={{ position: 'absolute' }}>
        <Circle cx={tamano / 2} cy={tamano / 2} r={radio} stroke={fondo} strokeWidth={grosor} fill="none" />
        <Circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          stroke={color}
          strokeWidth={grosor}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={circunferencia * (1 - avance)}
          transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
