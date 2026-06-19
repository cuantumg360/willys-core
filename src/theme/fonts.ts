import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { cloneElement, isValidElement } from 'react';
import { Text as RNText } from 'react-native';

/**
 * Fuentes de la app. Nunito (redondeada, cálida y premium) en varios pesos.
 * Las claves coinciden con el nombre de familia que usamos en los tokens de
 * tipografía (ver theme/index.ts), así cada peso se resuelve exacto.
 */
export const FONT_MAP = {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
};

/** Carga las fuentes; devuelve true cuando están listas. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts(FONT_MAP);
  return loaded;
}

/**
 * Aplica Nunito por defecto a TODO el texto de la app sin tocar cada estilo:
 * antepone la familia "Nunito" a cualquier <Text>. iOS resuelve el peso por
 * la familia + fontWeight; los tokens de tipografía fijan además la variante
 * exacta para los textos clave. Así no queda texto con la fuente del sistema.
 */
const TextAny = RNText as any;
if (!TextAny.__nunitoPatched) {
  const original = TextAny.render;
  if (typeof original === 'function') {
    TextAny.render = function patchedRender(...args: any[]) {
      const element = original.apply(this, args);
      if (!isValidElement(element)) return element;
      const props = element.props as { style?: unknown };
      return cloneElement(element, {
        style: [{ fontFamily: 'Nunito' }, props?.style],
      } as any);
    };
    TextAny.__nunitoPatched = true;
  }
}
