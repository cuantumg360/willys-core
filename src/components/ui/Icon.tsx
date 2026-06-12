import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ColorValue, Platform, Text } from 'react-native';

interface Props {
  /** SF Symbol (iOS, plataforma del MVP). */
  symbol: SymbolViewProps['name'];
  /** Fallback para Android/web durante el desarrollo. */
  emoji: string;
  size?: number;
  color?: ColorValue;
}

export function Icon({ symbol, emoji, size = 24, color }: Props) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={symbol} size={size} tintColor={color} />;
  }
  return <Text style={{ fontSize: size * 0.85 }}>{emoji}</Text>;
}
