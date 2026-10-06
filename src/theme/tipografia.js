/**
 * Tipografía de FocusSync (Poppins, la misma de los diseños).
 * Se usan nombres de fuente concretos porque en Android fontWeight no cambia
 * el grosor de una fuente personalizada; hay que cargar cada peso por separado.
 */
export const fuentes = {
  regular: 'Poppins_400Regular',
  media: 'Poppins_500Medium',
  seminegrita: 'Poppins_600SemiBold',
  negrita: 'Poppins_700Bold',
};

export const texto = {
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 22 },
  subtitulo: { fontFamily: fuentes.seminegrita, fontSize: 16 },
  cuerpo: { fontFamily: fuentes.regular, fontSize: 14.5 },
  pequeno: { fontFamily: fuentes.regular, fontSize: 12.5 },
  etiqueta: { fontFamily: fuentes.media, fontSize: 12.5 },
};
