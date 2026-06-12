import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BreedPicker } from '@/components/BreedPicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { spacing, type } from '@/theme';
import { newId } from '@/utils/id';

/** Perfil de mascota (modal): nombre, raza, edad y peso. */
export default function PetProfile() {
  const pet = useAppStore((s) => s.pets[0]);
  const addPet = useAppStore((s) => s.addPet);
  const updatePet = useAppStore((s) => s.updatePet);

  const [nombre, setNombre] = useState(pet?.nombre ?? '');
  const [raza, setRaza] = useState<string | undefined>(pet?.raza);
  const [edad, setEdad] = useState(pet?.edadAnios ? String(pet.edadAnios) : '');
  const [peso, setPeso] = useState(pet?.pesoKg ? String(pet.pesoKg) : '');

  const save = () => {
    const data = {
      nombre: nombre.trim(),
      raza,
      edadAnios: edad ? Number(edad.replace(',', '.')) || undefined : undefined,
      pesoKg: peso ? Number(peso.replace(',', '.')) || undefined : undefined,
    };
    if (pet) updatePet(pet.id, data);
    else addPet({ id: newId(), ...data });
    router.back();
  };

  return (
    <Screen scroll={false}>
      <Text style={[type.title, { textAlign: 'center' }]}>
        {pet ? t('pet.edit.title', { name: pet.nombre }) : t('pet.edit.newTitle')}
      </Text>
      <View style={styles.form}>
        <Field
          placeholder={t('ob.pet.namePlaceholder')}
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <BreedPicker label={t('ob.pet.breedLabel')} value={raza} onChange={setRaza} />
        <Field
          label={t('ob.pet.ageLabel', { optional: t('common.optional') })}
          placeholder={t('ob.pet.agePlaceholder')}
          value={edad}
          onChangeText={setEdad}
          keyboardType="number-pad"
        />
        <Field
          label={t('scan.intro.weightLabel', { optional: t('common.optional') })}
          placeholder={t('scan.intro.weightPlaceholder')}
          value={peso}
          onChangeText={setPeso}
          keyboardType="decimal-pad"
        />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={t('common.save')} onPress={save} disabled={!nombre.trim()} />
        <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', gap: spacing.md },
});
