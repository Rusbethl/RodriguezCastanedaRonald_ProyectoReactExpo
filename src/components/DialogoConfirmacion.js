/**
 * Diálogo de confirmación modal.
 *
 * Se dibuja encima de toda la app (Modal) y bloquea todo lo que hay detrás hasta que el
 * usuario responde. Funciona igual en Android, iOS y web (Alert.alert no muestra los
 * botones en web).
 *
 * Props:
 *   visible       true para mostrarlo
 *   titulo        título del diálogo
 *   mensaje       texto explicativo
 *   icono         nombre de un ícono de Feather (opcional)
 *   textoConfirmar / textoCancelar   texto de los botones (por defecto "Confirmar" y "Cancelar")
 *   peligroso     true pinta el botón de confirmar en coral (acciones que no se pueden deshacer)
 *   cargando      true muestra un indicador en Confirmar y desactiva Cancelar (evita doble acción)
 *   alConfirmar   se llama al tocar Confirmar
 *   alCancelar    se llama al tocar Cancelar o al usar el botón "atrás" de Android
 *
 * No se cierra tocando afuera (el fondo no tiene acción), igual que setCancelable(false)
 * en un AlertDialog de Android.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '../theme';

export default function DialogoConfirmacion({
  visible,
  titulo,
  mensaje,
  icono,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligroso = false,
  cargando = false,
  alConfirmar,
  alCancelar,
}) {
  const colorAccion = peligroso ? colores.coral : colores.verde;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={alCancelar} statusBarTranslucent>
      <View style={estilos.fondo}>
        <View style={estilos.cuadro} accessibilityRole="alert" accessibilityViewIsModal>
          {icono && (
            <View style={[estilos.icono, { backgroundColor: peligroso ? colores.coralSuave : colores.cremaOscuro }]}>
              <Feather name={icono} size={24} color={colorAccion} />
            </View>
          )}
          <Text style={estilos.titulo}>{titulo}</Text>
          {!!mensaje && <Text style={estilos.mensaje}>{mensaje}</Text>}
          <View style={estilos.botones}>
            <Pressable
              onPress={alCancelar}
              disabled={cargando}
              accessibilityRole="button"
              style={({ pressed }) => [estilos.boton, estilos.cancelar, (pressed || cargando) && estilos.atenuado]}
            >
              <Text style={[estilos.botonTexto, { color: colores.verde }]}>{textoCancelar}</Text>
            </Pressable>
            <Pressable
              onPress={alConfirmar}
              disabled={cargando}
              accessibilityRole="button"
              style={({ pressed }) => [estilos.boton, { backgroundColor: colorAccion }, (pressed || cargando) && estilos.atenuado]}
            >
              {cargando ? <ActivityIndicator color={colores.blanco} /> : <Text style={[estilos.botonTexto, { color: colores.blanco }]}>{textoConfirmar}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(15,25,21,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  cuadro: { width: '100%', maxWidth: 380, backgroundColor: colores.blanco, borderRadius: 22, padding: 22, alignItems: 'center' },
  icono: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 18, color: colores.texto, textAlign: 'center' },
  mensaje: { fontFamily: fuentes.regular, fontSize: 14, lineHeight: 20, color: colores.textoSecundario, textAlign: 'center', marginTop: 8 },
  botones: { flexDirection: 'row', gap: 10, marginTop: 20, alignSelf: 'stretch' },
  boton: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cancelar: { borderWidth: 1.5, borderColor: colores.verde },
  botonTexto: { fontFamily: fuentes.seminegrita, fontSize: 15 },
  atenuado: { opacity: 0.6 },
});
