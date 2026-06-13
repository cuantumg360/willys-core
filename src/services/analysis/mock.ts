import { AnalysisRequest, AnalysisResult } from './types';

/**
 * Motor mock (Fase 1): resultados realistas y variados para construir y
 * probar toda la UI sin coste de API. Se sustituye por el backend real
 * activando flags.useRealAnalysis (Fase 2).
 */

const BCS_RESULTS: Omit<AnalysisResult, 'tipo'>[] = [
  {
    puntuacion: 5,
    categoria: 'Peso ideal',
    titulo_resultado: '¡Está en su peso ideal!',
    explicacion:
      'Su cintura se marca bien vista desde arriba y el abdomen se recoge de perfil. Las costillas no se ven pero se palpan con facilidad: justo lo que buscamos.',
    detalles: [
      { nombre: 'Cintura visible', tipo: 'positivo', nota: 'Se aprecia una curva clara detrás de las costillas.' },
      { nombre: 'Abdomen recogido', tipo: 'positivo', nota: 'De perfil, la tripa sube hacia las patas traseras.' },
    ],
    recomendaciones: [
      'Mantén sus raciones y su rutina de paseos actual.',
      'Repite el escaneo una vez al mes para vigilar cambios.',
    ],
    confianza: 'alta',
    requiere_veterinario: false,
    peso_estimado_kg: 12.4,
  },
  {
    puntuacion: 7,
    categoria: 'Sobrepeso',
    titulo_resultado: 'Le sobran unos kilitos',
    explicacion:
      'Desde arriba apenas se distingue la cintura y de perfil el abdomen va recto en lugar de recogerse. No es grave, pero conviene actuar ahora para que no vaya a más.',
    detalles: [
      { nombre: 'Cintura poco marcada', tipo: 'negativo', nota: 'La silueta es casi recta entre costillas y cadera.' },
      { nombre: 'Depósitos de grasa', tipo: 'negativo', nota: 'Se intuye acumulación en la base de la cola.' },
      { nombre: 'Postura correcta', tipo: 'positivo', nota: 'Se mantiene erguido con normalidad.' },
    ],
    recomendaciones: [
      'Mide sus raciones con vaso medidor en lugar de a ojo.',
      'Añade 10-15 minutos más de paseo activo al día.',
      'Limita los premios a menos del 10% de su comida diaria.',
    ],
    confianza: 'alta',
    requiere_veterinario: false,
    peso_estimado_kg: 16.1,
  },
  {
    puntuacion: 8,
    categoria: 'Obesidad',
    titulo_resultado: 'Necesita perder peso, en serio',
    explicacion:
      'No se aprecia cintura y hay depósitos de grasa visibles en lomo y base de la cola. El exceso de peso acorta la vida de los perros y carga sus articulaciones.',
    detalles: [
      { nombre: 'Sin cintura visible', tipo: 'negativo', nota: 'La espalda se ve ensanchada desde arriba.' },
      { nombre: 'Abdomen descolgado', tipo: 'negativo', nota: 'De perfil, la tripa cuelga por debajo del pecho.' },
    ],
    recomendaciones: [
      'Pide a tu veterinario un plan de pérdida de peso adaptado.',
      'Sustituye premios calóricos por zanahoria o juego.',
    ],
    confianza: 'alta',
    requiere_veterinario: true,
    peso_estimado_kg: 21.7,
  },
];

const LABEL_RESULTS: Omit<AnalysisResult, 'tipo'>[] = [
  {
    puntuacion: 82,
    categoria: 'Buena calidad',
    titulo_resultado: 'Un pienso muy decente',
    explicacion:
      'La proteína animal aparece como primer ingrediente y no hay azúcares añadidos. Hay algo de cereal, pero en una posición razonable de la lista.',
    detalles: [
      { nombre: 'Pollo deshidratado (1.º)', tipo: 'positivo', nota: 'Proteína animal concreta como ingrediente principal.' },
      { nombre: 'Arroz integral', tipo: 'neutro', nota: 'Cereal digestible, aceptable en esta posición.' },
      { nombre: 'Pulpa de remolacha', tipo: 'neutro', nota: 'Fibra habitual, sin problema en pequeñas cantidades.' },
      { nombre: 'Conservantes naturales', tipo: 'positivo', nota: 'Usa tocoferoles en lugar de químicos como BHA/BHT.' },
    ],
    recomendaciones: [
      'Es una buena opción para el día a día.',
      'Ajusta la ración a su peso y nivel de actividad.',
    ],
    confianza: 'alta',
    requiere_veterinario: false,
  },
  {
    puntuacion: 34,
    categoria: 'Mala calidad',
    titulo_resultado: 'Este pienso deja que desear',
    explicacion:
      'Los primeros ingredientes son cereales y "subproductos cárnicos" sin especificar, y lleva azúcar añadido. Hay opciones mejores por un precio parecido.',
    detalles: [
      { nombre: 'Cereales (1.º)', tipo: 'negativo', nota: 'El ingrediente principal no es proteína animal.' },
      { nombre: 'Subproductos cárnicos', tipo: 'negativo', nota: 'Origen animal genérico, calidad imposible de saber.' },
      { nombre: 'Azúcares añadidos', tipo: 'negativo', nota: 'Innecesarios y contraproducentes para un perro.' },
      { nombre: 'BHA (E-320)', tipo: 'negativo', nota: 'Conservante artificial cuestionado; mejor evitarlo.' },
    ],
    recomendaciones: [
      'Busca un pienso con carne concreta como primer ingrediente.',
      'Si lo cambias, haz una transición gradual de 7-10 días.',
    ],
    confianza: 'alta',
    requiere_veterinario: false,
  },
  {
    puntuacion: 0,
    categoria: 'Foto no válida',
    titulo_resultado: 'No pudimos leer la etiqueta',
    explicacion:
      'La lista de ingredientes no se distingue en la foto. Acércate un poco más, busca buena luz y evita reflejos del plástico.',
    detalles: [],
    recomendaciones: ['Vuelve a hacer la foto encuadrando solo la lista de ingredientes.'],
    confianza: 'baja',
    requiere_veterinario: false,
  },
];

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

export async function analyzeMock(request: AnalysisRequest): Promise<AnalysisResult> {
  // Pequeña latencia para que la pantalla "Analizando…" se comporte como en real.
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const base =
    request.scannerId === 'condicion_corporal' ? pick(BCS_RESULTS) : pick(LABEL_RESULTS);
  return { ...base, tipo: request.scannerId };
}
