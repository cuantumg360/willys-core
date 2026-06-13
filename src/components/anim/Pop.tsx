import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props extends PropsWithChildren {
  delay?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Aparición con rebote elástico (escala + fundido). Más "satisfactoria"
 * que un simple fundido: se usa en momentos clave del onboarding.
 */
export function Pop({ children, delay = 0, style }: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, delay, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>
  );
}
