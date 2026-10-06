/**
 * Guarda los tokens JWT entre aperturas de la app.
 *
 * En el celular se usa expo-secure-store (Keychain en iOS, Keystore en Android),
 * así el token queda cifrado. SecureStore no existe en la versión web que usamos
 * para probar, por eso ahí se usa localStorage.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const esWeb = Platform.OS === 'web';

export async function guardar(clave, valor) {
  if (esWeb) return valor == null ? localStorage.removeItem(clave) : localStorage.setItem(clave, valor);
  if (valor == null) return SecureStore.deleteItemAsync(clave);
  return SecureStore.setItemAsync(clave, valor);
}

export async function leer(clave) {
  if (esWeb) return localStorage.getItem(clave);
  return SecureStore.getItemAsync(clave);
}
