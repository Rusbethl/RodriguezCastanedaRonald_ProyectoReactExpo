/**
 * index.js — punto de entrada que Expo busca al arrancar (definido en "main" de package.json).
 *
 * registerRootComponent registra App como el componente principal tanto en Expo Go
 * como en una compilación nativa, así que no hace falta tocar este archivo.
 */
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
