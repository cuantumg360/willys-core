import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { OverlayKind } from '@/features/scanners/registry';

const STROKE = 'rgba(255,255,255,0.92)';
const DASH = '12 10';
const common = {
  stroke: STROKE,
  strokeWidth: 3,
  strokeDasharray: DASH,
  fill: 'none' as const,
};
const BRACKET = { stroke: '#FFFFFF', strokeWidth: 3.2, strokeLinecap: 'round' as const, fill: 'none' as const };

/**
 * Guía de encuadre superpuesta a la cámara: silueta del objetivo que
 * "respira" (pulso), esquinas de encuadre y una línea de escaneo en
 * movimiento. Da sensación de captura guiada y profesional. Solo visual.
 */
export function CameraOverlay({ kind }: { kind: OverlayKind }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const [h, setH] = useState(0);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const scanLoop = Animated.loop(
      Animated.timing(scan, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    pulseLoop.start();
    scanLoop.start();
    return () => {
      pulseLoop.stop();
      scanLoop.stop();
    };
  }, [pulse, scan]);

  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] });
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [h * 0.2, h * 0.78] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {/* Esquinas de encuadre (fijas) */}
      <Svg width="100%" height="100%" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet">
        <Path d="M 10 38 L 10 28 L 20 28" {...BRACKET} />
        <Path d="M 80 28 L 90 28 L 90 38" {...BRACKET} />
        <Path d="M 90 122 L 90 132 L 80 132" {...BRACKET} />
        <Path d="M 20 132 L 10 132 L 10 122" {...BRACKET} />
      </Svg>

      {/* Silueta guía que "respira" */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet">
          {kind === 'dog-top' && (
            <>
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
              <Circle cx={24} cy={62} r={10} {...common} />
              <Path
                d="M 32 68 C 42 60, 70 58, 82 64 C 86 66, 86 74, 82 80 C 70 88, 52 90, 40 84 C 34 80, 30 74, 32 68"
                {...common}
              />
              <Path d="M 42 88 L 42 108 M 52 90 L 52 108 M 68 88 L 68 108 M 78 84 L 78 108" {...common} />
              <Path d="M 84 66 C 90 60, 94 58, 96 54" {...common} />
            </>
          )}
          {kind === 'label' && <Rect x={12} y={40} width={76} height={80} rx={6} {...common} />}
        </Svg>
      </Animated.View>

      {/* Línea de escaneo en movimiento */}
      {h > 0 && (
        <Animated.View style={[styles.scanWrap, { transform: [{ translateY: scanY }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(124,242,200,0.9)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLine}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scanWrap: { position: 'absolute', left: '12%', right: '12%', height: 14, justifyContent: 'center' },
  scanLine: { height: 2, borderRadius: 2 },
});
