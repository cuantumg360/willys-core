import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { OverlayKind } from '@/features/scanners/registry';

const STROKE = 'rgba(255,255,255,0.9)';
const DASH = '12 10';
const common = {
  stroke: STROKE,
  strokeWidth: 3,
  strokeDasharray: DASH,
  fill: 'none' as const,
};

/** Silueta de guía superpuesta a la cámara según el paso del escáner. */
export function CameraOverlay({ kind }: { kind: OverlayKind }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet">
        {kind === 'dog-top' && (
          <>
            {/* Perro visto desde arriba: cabeza + cuerpo con cintura + cola */}
            <Circle cx={50} cy={38} r={13} {...common} />
            <Path
              d="M 38 50 C 30 66, 33 76, 39 86 C 33 96, 31 110, 39 122 C 45 130, 55 130, 61 122 C 69 110, 67 96, 61 86 C 67 76, 70 66, 62 50"
              {...common}
            />
            <Path d="M 50 130 C 50 138, 56 142, 60 146" {...common} />
          </>
        )}
        {kind === 'dog-side' && (
          <>
            {/* Perro de perfil: cabeza, lomo y abdomen recogido, patas */}
            <Circle cx={24} cy={62} r={10} {...common} />
            <Path
              d="M 32 68 C 42 60, 70 58, 82 64 C 86 66, 86 74, 82 80 C 70 88, 52 90, 40 84 C 34 80, 30 74, 32 68"
              {...common}
            />
            <Path d="M 42 88 L 42 108 M 52 90 L 52 108 M 68 88 L 68 108 M 78 84 L 78 108" {...common} />
            <Path d="M 84 66 C 90 60, 94 58, 96 54" {...common} />
          </>
        )}
        {kind === 'label' && (
          <Rect x={12} y={40} width={76} height={80} rx={6} {...common} />
        )}
      </Svg>
    </View>
  );
}
