import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

interface Props {
  uri?: string;
  size?: number;
  /** Si se pasa, el avatar es pulsable y deja elegir/cambiar la foto. */
  onChange?: (uri: string) => void;
}

/**
 * Avatar circular de la mascota. Sin onChange es solo presentación (lo
 * usamos en inicio, ajustes, etc.). Con onChange permite poner/cambiar la
 * foto desde cámara o galería, recortada en cuadrado.
 */
export function PetAvatar({ uri, size = 100, onChange }: Props) {
  const launch = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]?.uri) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange?.(result.assets[0].uri);
    }
  };

  const choose = () => {
    Alert.alert(t('pet.photo.title'), undefined, [
      { text: t('pet.photo.camera'), onPress: () => launch('camera') },
      { text: t('pet.photo.gallery'), onPress: () => launch('gallery') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const circle = (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={250}
        />
      ) : (
        <Text style={{ fontSize: size * 0.42 }}>🐶</Text>
      )}
    </View>
  );

  if (!onChange) return circle;

  return (
    <View style={styles.editable}>
      <Pressable onPress={choose} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
        {circle}
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>📷</Text>
        </View>
      </Pressable>
      <Text style={styles.hint}>{uri ? t('pet.photo.change') : t('pet.photo.add')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editable: { alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: { fontSize: 15 },
  hint: { ...type.small, color: colors.primary, fontWeight: '600' },
});
