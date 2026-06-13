/**
 * Diccionario español (único idioma del lanzamiento, español neutro
 * válido para España y LatAm). Para añadir inglés en 2027: crear en.ts
 * con las mismas claves y registrarlo en i18n/index.ts. Ningún texto
 * visible debe escribirse fuera de este fichero.
 *
 * Placeholders: {name} = nombre del perro, {app} = nombre de la app.
 */
export const es = {
  // ── Comunes ──────────────────────────────────────────────────────────
  'common.continue': 'Continuar',
  'common.start': 'Empezar',
  'common.close': 'Cerrar',
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.done': 'Hecho',
  'common.retry': 'Reintentar',
  'common.share': 'Compartir',
  'common.search': 'Buscar…',
  'common.optional': 'opcional',
  'common.notNow': 'Ahora no',

  // ── Onboarding ───────────────────────────────────────────────────────
  'ob.hook.title': 'La mitad de los perros tiene sobrepeso…',
  'ob.hook.subtitle': '…y sus dueños no lo saben. Haz una foto a tu perro y sal de dudas en segundos.',
  'ob.hook.stat': '1 de cada 2 perros',
  'ob.hook.statCaption': 'tiene sobrepeso sin que su familia lo sepa',

  'ob.how.title': 'Así de fácil',
  'ob.how.step1.title': 'Haz una foto',
  'ob.how.step1.desc': 'A tu perro o a la etiqueta de su comida.',
  'ob.how.step2.title': 'La IA la analiza',
  'ob.how.step2.desc': 'Teniendo en cuenta su raza y su edad.',
  'ob.how.step3.title': 'Resultado claro',
  'ob.how.step3.desc': 'Un veredicto sencillo y qué hacer después.',

  'ob.pet.title': '¿Cómo se llama tu perro?',
  'ob.pet.namePlaceholder': 'Su nombre',
  'ob.pet.breedLabel': 'Raza',
  'ob.pet.breedPlaceholder': 'Elige su raza (o mestizo)',
  'ob.pet.ageLabel': 'Edad aproximada en años ({optional})',
  'ob.pet.agePlaceholder': 'Ej.: 4',
  'ob.pet.note': 'Usaremos su nombre para personalizar todos sus resultados.',

  'ob.camera.title': 'Necesitamos la cámara para ver a {name}',
  'ob.camera.body': 'Solo usamos la cámara para las fotos que tú decidas hacer. Las fotos se analizan y no se guardan en ningún servidor.',
  'ob.camera.cta': 'Permitir cámara',

  // ── Paywall ──────────────────────────────────────────────────────────
  'paywall.title': 'Escaneos ilimitados para cuidar a {name}',
  'paywall.titleNoName': 'Escaneos ilimitados para cuidar a tu perro',
  'paywall.bullet1': 'Controla su peso con la escala veterinaria BCS',
  'paywall.bullet2': 'Analiza cualquier pienso o snack al instante',
  'paywall.bullet3': 'Historial, evolución y perfiles sin límites',
  'paywall.plan.annual': 'Anual',
  'paywall.plan.annualPrice': '29,99 €/año',
  'paywall.plan.annualTrial': 'Incluye 3 días de prueba gratis',
  'paywall.plan.annualBadge': 'AHORRA 85%',
  'paywall.plan.weekly': 'Semanal',
  'paywall.plan.weeklyPrice': '4,99 €/semana',
  'paywall.plan.lifetime': 'Fundador · acceso de por vida',
  'paywall.plan.lifetimePrice': '24,99 € · pago único',
  'paywall.cta.trial': 'Empezar 3 días gratis',
  'paywall.cta.buy': 'Continuar',
  'paywall.trialNote': 'Después, 29,99 €/año. Cancela cuando quieras desde el App Store.',
  'paywall.weeklyNote': 'Se renueva cada semana. Cancela cuando quieras desde el App Store.',
  'paywall.restore': 'Restaurar compras',
  'paywall.terms': 'Términos de uso',
  'paywall.privacy': 'Privacidad',

  // ── Inicio ───────────────────────────────────────────────────────────
  'home.greeting': 'Hola 👋 ¿Cómo está {name} hoy?',
  'home.greetingNoPet': 'Hola 👋',
  'home.greetingEyebrow': 'Hola 👋',
  'home.greetingPet': '¿Cómo está {name}?',
  'home.greetingNoPetTitle': '¿Cómo está tu perro?',
  'home.scanners': 'Escáneres',
  'home.scansLeft.many': 'Te quedan {count} escaneos gratis',
  'home.scansLeft.one': 'Te queda 1 escaneo gratis',
  'home.scansLeft.none': 'Has usado tus escaneos gratis',
  'home.premium': 'Premium',
  'home.lastScan': 'Último escaneo',

  // ── Escáner: condición corporal ─────────────────────────────────────
  'scanner.bcs.title': '¿Está en su peso?',
  'scanner.bcs.subtitle': 'Condición corporal con 2 fotos',
  'scanner.bcs.intro': 'Haremos 2 fotos guiadas a {name}: una desde arriba y otra de perfil. Con ellas calculamos su condición corporal en la escala veterinaria BCS (1-9).',
  'scanner.bcs.step.top.title': 'Foto desde arriba',
  'scanner.bcs.step.top.hint': 'Ponte de pie sobre {name} y encaja su cuerpo en la silueta',
  'scanner.bcs.step.side.title': 'Foto de perfil',
  'scanner.bcs.step.side.hint': 'Agáchate a su altura y enfoca el cuerpo completo',
  'scanner.bcs.analyzing.1': 'Analizando silueta…',
  'scanner.bcs.analyzing.2': 'Comparando con su raza…',
  'scanner.bcs.analyzing.3': 'Calculando condición corporal…',
  'scanner.bcs.scale': 'Escala de condición corporal (BCS 1-9)',

  // ── Escáner: etiqueta de comida ─────────────────────────────────────
  'scanner.label.title': '¿Es bueno este pienso?',
  'scanner.label.subtitle': 'Analiza la etiqueta de ingredientes',
  'scanner.label.intro': 'Haz una foto a la lista de ingredientes del pienso o snack y te diremos qué tal es para {name}, con nota de 0 a 100.',
  'scanner.label.step.label.title': 'Foto a los ingredientes',
  'scanner.label.step.label.hint': 'Encuadra la lista de ingredientes y evita reflejos',
  'scanner.label.analyzing.1': 'Leyendo ingredientes…',
  'scanner.label.analyzing.2': 'Evaluando calidad nutricional…',
  'scanner.label.analyzing.3': 'Preparando tu resultado…',
  'scanner.label.scale': 'Nota de calidad (0-100)',

  // ── Flujo de escaneo común ──────────────────────────────────────────
  'scan.intro.cta': 'Hacer foto',
  'scan.intro.optionalData': 'Datos opcionales (mejoran el análisis)',
  'scan.intro.weightLabel': 'Peso conocido en kg ({optional})',
  'scan.intro.weightPlaceholder': 'Ej.: 12,5',
  'scan.camera.stepCount': 'Foto {n} de {total}',
  'scan.camera.gallery': 'Galería',
  'scan.camera.permissionTitle': 'Sin acceso a la cámara',
  'scan.camera.permissionBody': 'Activa el permiso de cámara en Ajustes para poder escanear, o elige una foto de tu galería.',
  'scan.camera.openSettings': 'Abrir Ajustes',

  // ── Resultado ───────────────────────────────────────────────────────
  'result.details': 'Lo más relevante',
  'result.recommendations': 'Recomendaciones',
  'result.vetBanner': 'Hemos visto algo que conviene revisar. Te recomendamos consultarlo con tu veterinario cuanto antes.',
  'result.disclaimer': 'Esta app no sustituye el diagnóstico de un veterinario. Ante cualquier duda sobre la salud de tu mascota, consulta a un profesional.',
  'result.confidence.media': 'Análisis orientativo: la foto no era del todo clara.',
  'result.lowConfidence.title': 'No hemos podido analizar bien la foto',
  'result.lowConfidence.retry': 'Repetir foto',
  'result.share.footer': 'Escaneado con {app} 🐾',
  'result.share.unavailableTitle': 'Compartir aún no disponible',
  'result.share.unavailableBody': 'La tarjeta para compartir funcionará en la app instalada desde la App Store. En la versión de prueba (Expo Go) esta función está desactivada.',

  // ── Historial ───────────────────────────────────────────────────────
  'history.title': 'Historial',
  'history.empty.title': 'Aún no hay escaneos',
  'history.empty.body': 'Haz tu primer escaneo y aparecerá aquí, con la evolución de {name} a lo largo del tiempo.',
  'history.empty.bodyNoPet': 'Haz tu primer escaneo y aparecerá aquí.',
  'history.trend.title': 'Evolución de {name}',
  'history.trend.caption': 'Condición corporal (BCS) · la banda verde es el rango ideal',

  // ── Ajustes ─────────────────────────────────────────────────────────
  'settings.title': 'Ajustes',
  'settings.pet.section': 'Tu mascota',
  'settings.pet.edit': 'Editar perfil',
  'settings.pet.addLocked': 'Más de un perro: disponible en premium',
  'settings.sub.section': 'Suscripción',
  'settings.sub.active': 'Premium activo',
  'settings.sub.inactive': 'Hazte premium',
  'settings.sub.restore': 'Restaurar compras',
  'settings.legal.section': 'Legal',
  'settings.legal.terms': 'Términos de uso',
  'settings.legal.privacy': 'Política de privacidad',
  'settings.contact': 'Contacto',
  'settings.version': 'Versión {version}',

  // ── Perfil de mascota ───────────────────────────────────────────────
  'pet.edit.title': 'Perfil de {name}',
  'pet.edit.newTitle': 'Nuevo perfil',
  'pet.photo.title': 'Foto de tu perro',
  'pet.photo.camera': 'Hacer una foto',
  'pet.photo.gallery': 'Elegir de la galería',
  'pet.photo.add': 'Añadir foto',
  'pet.photo.change': 'Cambiar foto',

  // ── Legal (placeholders, sustituir por textos revisados) ───────────
  'legal.terms.title': 'Términos de uso',
  'legal.privacy.title': 'Política de privacidad',
} as const;
