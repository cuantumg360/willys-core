import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { APP_NAME } from '@/config/app';
import { colors, type } from '@/theme';

const CREAM = '#FBF1E2';
const CARAMEL = '#D89A66';
const DARK = '#2B2722';

interface Props {
  size?: number;
  /** Muestra el nombre de la app debajo del icono. */
  withWordmark?: boolean;
  /** Pinta el icono sobre un cuadrado redondeado con el color de marca. */
  withBackground?: boolean;
}

/**
 * Logo de la app: una cara de perrito tierna y reconocible, hecha en SVG
 * (se ve nítida a cualquier tamaño). Es la base del icono y de la marca.
 */
export function Logo({ size = 96, withWordmark = false, withBackground = false }: Props) {
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: size * 0.28 },
          withBackground && { backgroundColor: colors.primary },
        ]}
      >
        <Svg width={size * 0.84} height={size * 0.84} viewBox="0 0 120 120">
          {/* Orejas caídas */}
          <Ellipse cx="32" cy="46" rx="13" ry="21" fill={CARAMEL} transform="rotate(-24 32 46)" />
          <Ellipse cx="88" cy="46" rx="13" ry="21" fill={CARAMEL} transform="rotate(24 88 46)" />
          {/* Cara */}
          <Circle cx="60" cy="64" r="35" fill={CREAM} />
          {/* Hocico claro */}
          <Ellipse cx="60" cy="78" rx="17" ry="13" fill="#FFFFFF" />
          {/* Ojos */}
          <Circle cx="48" cy="60" r="5" fill={DARK} />
          <Circle cx="72" cy="60" r="5" fill={DARK} />
          {/* Mejillas */}
          <Circle cx="40" cy="72" r="4.5" fill="#F4C0B0" opacity={0.8} />
          <Circle cx="80" cy="72" r="4.5" fill="#F4C0B0" opacity={0.8} />
          {/* Nariz y boca */}
          <Ellipse cx="60" cy="74" rx="6.5" ry="5" fill={DARK} />
          <Path
            d="M60 79 C 60 86, 53 88, 50 84 M60 79 C 60 86, 67 88, 70 84"
            stroke={DARK}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>
      {withWordmark && <Text style={styles.wordmark}>{APP_NAME}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  mark: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  wordmark: { ...type.title, color: colors.text, fontWeight: '800' },
});
