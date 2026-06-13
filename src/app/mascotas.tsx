import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PetAvatar } from '@/components/PetAvatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { canAddPet, MAX_PETS } from '@/config/limits';
import { t } from '@/i18n';
import * as Haptics from 'expo-haptics';
import { usePurchases } from '@/services/purchases';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, shadow, spacing, type } from '@/theme';

/** Gestión multi-mascota: cambiar la activa, editar, añadir (gated) y borrar. */
export default function Pets() {
  const pets = useAppStore((s) => s.pets);
  const activePetId = useAppStore((s) => s.activePetId);
  const setActivePet = useAppStore((s) => s.setActivePet);
  const premium = usePurchases((s) => s.premium);

  const activeId = activePetId ?? pets[0]?.id;

  const add = () => {
    if (canAddPet(premium, pets.length)) {
      router.push('/mascota');
    } else if (!premium) {
      router.push('/paywall?context=mascotas');
    } else {
      Alert.alert(t('pets.maxReached', { max: MAX_PETS }));
    }
  };

  const select = (id: string) => {
    Haptics.selectionAsync();
    setActivePet(id);
  };

  return (
    <Screen>
      <Text style={type.title}>{t('pets.title')}</Text>
      <Text style={[type.small, { marginTop: spacing.xs }]}>
        {t('pets.subtitle', { count: pets.length, max: premium ? MAX_PETS : 1 })}
      </Text>

      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {pets.map((pet) => {
          const isActive = pet.id === activeId;
          return (
            <PressableScale
              key={pet.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => select(pet.id)}
            >
              <PetAvatar uri={pet.fotoUri} size={52} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.body, { fontWeight: '700' }]}>{pet.nombre}</Text>
                <Text style={type.small}>
                  {isActive ? t('pets.active') : (pet.raza ?? t('pets.setActive'))}
                </Text>
              </View>
              {isActive && <View style={styles.activeDot} />}
              <Pressable
                onPress={() => router.push(`/mascota?id=${pet.id}`)}
                hitSlop={10}
                style={styles.editBtn}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </Pressable>
            </PressableScale>
          );
        })}

        <PressableScale style={styles.addCard} onPress={add}>
          <Text style={styles.addPlus}>＋</Text>
          <Text style={[type.body, { fontWeight: '700', color: colors.primary }]}>
            {t('pets.add')}
          </Text>
        </PressableScale>

        {!premium && pets.length >= 1 && (
          <Text style={[type.small, { textAlign: 'center' }]}>
            {t('pets.addLockedFree', { max: MAX_PETS })}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: spacing.md,
    ...shadow.card,
  },
  cardActive: { borderColor: colors.primary },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  editBtn: { padding: spacing.xs },
  editIcon: { fontSize: 18 },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  addPlus: { fontSize: 22, fontWeight: '800', color: colors.primary },
});
