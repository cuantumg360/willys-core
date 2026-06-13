import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui/Icon';
import { t } from '@/i18n';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Icon symbol="house.fill" emoji="🏠" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="salud"
        options={{
          title: t('tab.salud'),
          tabBarIcon: ({ color, size }) => (
            <Icon symbol="heart.fill" emoji="❤️" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: t('history.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon symbol="clock.fill" emoji="🕒" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon symbol="gearshape.fill" emoji="⚙️" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
