import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { APP_NAME } from '@/config/app';
import { t } from '@/i18n';
import { spacing, type } from '@/theme';

/**
 * PLACEHOLDER — sustituir por términos revisados por un profesional antes
 * de enviar a revisión de Apple (obligatorios con suscripciones).
 */
export default function Terms() {
  return (
    <Screen>
      <Text style={type.title}>{t('legal.terms.title')}</Text>
      <View style={{ gap: spacing.md, marginVertical: spacing.lg, flex: 1 }}>
        <Text style={type.body}>
          {APP_NAME} es una herramienta informativa y educativa. Los análisis generados por
          inteligencia artificial son orientativos y NO constituyen diagnóstico, tratamiento ni
          asesoramiento veterinario.
        </Text>
        <Text style={type.body}>
          Ante cualquier duda sobre la salud de tu mascota, consulta siempre a un veterinario
          profesional.
        </Text>
        <Text style={type.body}>
          Las suscripciones se gestionan a través de tu cuenta de App Store y se renuevan
          automáticamente salvo cancelación al menos 24 horas antes del final del periodo en curso.
          La prueba gratuita, si la hay, se convierte en suscripción de pago al finalizar salvo
          cancelación.
        </Text>
        <Text style={type.bodyMuted}>
          [TODO LEGAL: completar identidad del titular, jurisdicción, limitación de
          responsabilidad, propiedad intelectual y condiciones completas antes del lanzamiento.]
        </Text>
      </View>
      <Button label={t('common.close')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
