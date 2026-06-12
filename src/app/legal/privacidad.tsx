import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { APP_NAME } from '@/config/app';
import { t } from '@/i18n';
import { spacing, type } from '@/theme';

/**
 * PLACEHOLDER — sustituir por política revisada antes de enviar a Apple.
 * Debe coincidir con los "nutrition labels" declarados en App Store Connect.
 */
export default function Privacy() {
  return (
    <Screen>
      <Text style={type.title}>{t('legal.privacy.title')}</Text>
      <View style={{ gap: spacing.md, marginVertical: spacing.lg, flex: 1 }}>
        <Text style={type.body}>
          {APP_NAME} no requiere cuenta de usuario. El historial de escaneos y el perfil de tu
          mascota se guardan únicamente en tu dispositivo.
        </Text>
        <Text style={type.body}>
          Las fotos que haces se envían de forma segura a nuestro servicio de análisis, se procesan
          para generar el resultado y NO se almacenan en el servidor más allá del análisis.
        </Text>
        <Text style={type.body}>
          Usamos servicios de terceros para las compras (RevenueCat/App Store) y analítica de uso
          anónima. No vendemos tus datos.
        </Text>
        <Text style={type.bodyMuted}>
          [TODO LEGAL: completar responsable del tratamiento, base legal (RGPD), subencargados,
          derechos ARCO y contacto antes del lanzamiento.]
        </Text>
      </View>
      <Button label={t('common.close')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
