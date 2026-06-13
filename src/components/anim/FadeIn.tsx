import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props extends PropsWithChildren {
  /** Retardo de entrada en ms (para escalonar varios elementos). */
  delay?: number;
  duration?: number;
  /** Desplazamiento vertical inicial: el contenido entra subiendo. */
  offsetY?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Entrada suave (fundido + leve subida) al montar. Native driver, así que
 * va a 60fps. Es la base del "feel" premium: se usa para escalonar la
 * aparición de tarjetas, secciones de resultado y pasos de onboarding.
 */
export function FadeIn({ children, delay = 0, duration = 460, offsetY = 14, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offsetY, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
