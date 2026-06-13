import { PropsWithChildren, useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

interface Props extends PropsWithChildren {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tarjeta/zona pulsable con rebote elástico al tocar. Da el mismo tacto
 * premium que los botones a cualquier elemento interactivo.
 */
export function PressableScale({ children, onPress, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => spring(0.97)}
        onPressOut={() => spring(1)}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
