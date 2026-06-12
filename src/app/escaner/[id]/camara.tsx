import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraOverlay } from '@/components/CameraOverlay';
import { Button } from '@/components/ui/Button';
import { getScanner } from '@/features/scanners/registry';
import { t } from '@/i18n';
import { usePendingScan } from '@/store/usePendingScan';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, radius, spacing, type } from '@/theme';

/** Cámara guiada: silueta superpuesta, una pantalla por foto del escáner. */
export default function ScannerCamera() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scanner = getScanner(id);
  const pet = usePrimaryPet();
  const addPhoto = usePendingScan((s) => s.addPhoto);
  const insets = useSafeAreaInsets();

  const cameraRef = useRef<CameraView>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [taking, setTaking] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!scanner) return <Redirect href="/inicio" />;
  const step = scanner.photoSteps[stepIndex];
  const petName = pet?.nombre ?? 'tu perro';

  const handlePhoto = (uri: string) => {
    addPhoto(uri);
    if (stepIndex + 1 < scanner.photoSteps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      router.replace(`/escaner/${scanner.id}/analizando`);
    }
  };

  const shoot = async () => {
    if (taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) handlePhoto(photo.uri);
    } finally {
      setTaking(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) handlePhoto(result.assets[0].uri);
  };

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.permission, { paddingTop: insets.top }]}>
        <Text style={[type.title, { textAlign: 'center' }]}>{t('scan.camera.permissionTitle')}</Text>
        <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('scan.camera.permissionBody')}</Text>
        {permission.canAskAgain ? (
          <Button label={t('ob.camera.cta')} onPress={() => requestPermission()} />
        ) : (
          <Button label={t('scan.camera.openSettings')} onPress={() => Linking.openSettings()} />
        )}
        <Button label={t('scan.camera.gallery')} variant="secondary" onPress={pickFromGallery} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <CameraOverlay kind={step.overlay} />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        {scanner.photoSteps.length > 1 && (
          <Text style={styles.stepCount}>
            {t('scan.camera.stepCount', { n: stepIndex + 1, total: scanner.photoSteps.length })}
          </Text>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>{t(step.titleKey, { name: petName })}</Text>
          <Text style={styles.hintText}>{t(step.hintKey, { name: petName })}</Text>
        </View>
        <View style={styles.controls}>
          <Pressable onPress={pickFromGallery} hitSlop={12}>
            <Text style={styles.gallery}>{t('scan.camera.gallery')}</Text>
          </Pressable>
          <Pressable onPress={shoot} disabled={taking} style={styles.shutterOuter}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={{ width: 60 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  permission: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  stepCount: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  hintCard: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  hintTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hintText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 19 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gallery: { color: '#fff', fontWeight: '600', width: 60 },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
});
