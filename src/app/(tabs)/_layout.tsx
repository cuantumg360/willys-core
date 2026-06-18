import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="salud" />
      <Tabs.Screen name="historial" />
      <Tabs.Screen name="ajustes" />
    </Tabs>
  );
}
