import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { BreedPicker } from '@/components/BreedPicker';
import { PetAvatar } from '@/components/PetAvatar';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { spacing, type } from '@/theme';
import { newId } from '@/utils/id';

/**
 * Onboarding 3/5 — personalización. Crear el perfil aquí genera la
 * inversión emocional: a partir de este punto toda la app habla del
 * perro por su nombre.
 */
export default function OnboardingPet() {
  const existing = useAppStore((s) => s.pets[0]);
  const addPet = useAppStore((s) => s.addPet);
  const updatePet = useAppStore((s) => s.updatePet);

  const [foto, setFoto] = useState<string | undefined>(existing?.fotoUri);
  const [nombre, setNombre] = useState(existing?.nombre ?? '');
  const [raza, setRaza] = useState<string | undefined>(existing?.raza);
  const [edad, setEdad] = useState(existing?.edadAnios ? String(existing.edadAnios) : '');

  const save = () => {
    const data = {
      nombre: nombre.trim(),
      raza,
      fotoUri: foto,
      edadAnios: edad ? Number(edad.replace(',', '.')) || undefined : undefined,
    };
    if (existing) {
      updatePet(existing.id, data);
    } else {
      addPet({ id: newId(), ...data });
    }
    router.push('/onboarding/camara');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <ProgressBar step={3} total={5} />
        <View style={styles.center}>
          <Text style={[type.title, { textAlign: 'center' }]}>{t('ob.pet.title')}</Text>
          <View style={styles.avatar}>
            <PetAvatar uri={foto} size={92} onChange={setFoto} />
          </View>
          <View style={{ gap: spacing.md, width: '100%' }}>
            <Field
              placeholder={t('ob.pet.namePlaceholder')}
              value={nombre}
              onChangeText={setNombre}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
            />
            <BreedPicker label={t('ob.pet.breedLabel')} value={raza} onChange={setRaza} />
            <Field
              label={t('ob.pet.ageLabel', { optional: t('common.optional') })}
              placeholder={t('ob.pet.agePlaceholder')}
              value={edad}
              onChangeText={setEdad}
              keyboardType="number-pad"
            />
          </View>
          <Text style={[type.small, { textAlign: 'center' }]}>{t('ob.pet.note')}</Text>
        </View>
        <Button label={t('common.continue')} onPress={save} disabled={!nombre.trim()} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  avatar: { alignItems: 'center' },
});
