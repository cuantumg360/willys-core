import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

const STAGE_H = 260;

interface Props {
  uris: string[];
}

/**
 * Muestra las fotos reales que el dueño hizo de su perro con un tratamiento
 * de "escaneo IA" premium: línea de escaneo en movimiento, esquinas de
 * encuadre y sello de "analizada". Si hay varias fotos, se puede tocar la
 * miniatura para cambiar la principal. Refuerza que el análisis es sobre
 * SU perro, sin fingir detección de zonas sobre la foto real.
 */
export function ScanPhotos({ uris }: Props) {
  const scan = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  if (uris.length === 0) return null;

  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [10, STAGE_H - 14] });
  const activeUri = uris[Math.min(active, uris.length - 1)];

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Image source={{ uri: activeUri }} style={styles.photo} contentFit="cover" transition={200} />

        {/* Velo sutil para que el overlay se lea bien */}
        <LinearGradient
          colors={['rgba(16,32,26,0.28)', 'transparent', 'rgba(16,32,26,0.30)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Esquinas de encuadre */}
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />

        {/* Línea de escaneo */}
        <Animated.View style={[styles.scanWrap, { transform: [{ translateY: scanY }] }]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(124,242,200,0.95)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLine}
          />
        </Animated.View>

        {/* Sello */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{t('result.photos.badge')}</Text>
        </View>
      </View>

      {/* Miniaturas si hay más de una foto */}
      {uris.length > 1 && (
        <View style={styles.thumbs}>
          {uris.map((uri, i) => (
            <Pressable key={`${uri}-${i}`} onPress={() => setActive(i)} style={[styles.thumb, i === active && styles.thumbActive]}>
              <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" />
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.caption}>{t('result.photos.caption')}</Text>
    </View>
  );
}

const BRACKET = 22;
const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  stage: {
    height: STAGE_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#10201A',
  },
  photo: { width: '100%', height: '100%' },
  corner: { position: 'absolute', width: BRACKET, height: BRACKET, borderColor: 'rgba(255,255,255,0.85)' },
  tl: { top: spacing.sm, left: spacing.sm, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: spacing.sm, right: spacing.sm, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: spacing.sm, left: spacing.sm, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: spacing.sm, right: spacing.sm, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scanWrap: { position: 'absolute', left: 0, right: 0, height: 14, justifyContent: 'center' },
  scanLine: { height: 2.5, borderRadius: 2 },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,32,26,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.good },
  badgeText: { ...type.small, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  thumbs: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: colors.primary },
  thumbImg: { width: '100%', height: '100%' },
  caption: { ...type.small, textAlign: 'center', color: colors.textMuted },
});
