/**
 * Contrato JSON entre la IA de visión y la app. Es el MISMO esquema que
 * exigirá el system prompt del backend (Fase 2): si cambia aquí, debe
 * cambiar allí. La validación es manual y estricta para no confiar nunca
 * en la salida del modelo.
 */

export type ScannerId = 'condicion_corporal' | 'etiqueta' | 'toxicidad';

export type Confianza = 'alta' | 'media' | 'baja';

export type DetalleTipo = 'positivo' | 'negativo' | 'neutro';

export interface AnalysisDetail {
  nombre: string;
  tipo: DetalleTipo;
  /** Una frase. */
  nota: string;
}

export interface AnalysisResult {
  tipo: ScannerId;
  /** BCS 1-9 para condición corporal; 0-100 para etiqueta. */
  puntuacion: number;
  categoria: string;
  /** Frase de impacto, máx. 8 palabras. */
  titulo_resultado: string;
  /** 2-3 frases, lenguaje llano, español neutro. */
  explicacion: string;
  detalles: AnalysisDetail[];
  /** Máx. 3, generales, nunca médicas. */
  recomendaciones: string[];
  confianza: Confianza;
  requiere_veterinario: boolean;
  /** Peso estimado en kg (solo escáner de condición corporal). */
  peso_estimado_kg?: number;
}

/** Lo que la app envía al motor de análisis. */
export interface AnalysisRequest {
  scannerId: ScannerId;
  /** URIs locales de las fotos, ya en orden (cenital, perfil / etiqueta). */
  photoUris: string[];
  pet?: {
    nombre?: string;
    raza?: string;
    edadAnios?: number;
    pesoKg?: number;
  };
}

const CONFIANZAS: readonly string[] = ['alta', 'media', 'baja'];
const DETALLE_TIPOS: readonly string[] = ['positivo', 'negativo', 'neutro'];
const SCANNER_IDS: readonly string[] = ['condicion_corporal', 'etiqueta', 'toxicidad'];

export class InvalidAnalysisError extends Error {}

function fail(reason: string): never {
  throw new InvalidAnalysisError(`Respuesta de análisis inválida: ${reason}`);
}

/** Valida y normaliza la respuesta del modelo. Lanza si no cumple el esquema. */
export function validateAnalysisResult(raw: unknown): AnalysisResult {
  if (typeof raw !== 'object' || raw === null) fail('no es un objeto');
  const r = raw as Record<string, unknown>;

  if (typeof r.tipo !== 'string' || !SCANNER_IDS.includes(r.tipo)) fail('tipo desconocido');
  if (typeof r.puntuacion !== 'number' || !Number.isFinite(r.puntuacion)) fail('puntuacion no numérica');
  if (typeof r.categoria !== 'string' || r.categoria.length === 0) fail('categoria vacía');
  if (typeof r.titulo_resultado !== 'string') fail('falta titulo_resultado');
  if (typeof r.explicacion !== 'string') fail('falta explicacion');
  if (typeof r.confianza !== 'string' || !CONFIANZAS.includes(r.confianza)) fail('confianza inválida');
  if (typeof r.requiere_veterinario !== 'boolean') fail('falta requiere_veterinario');
  if (!Array.isArray(r.detalles)) fail('detalles no es lista');
  if (!Array.isArray(r.recomendaciones)) fail('recomendaciones no es lista');

  const tipo = r.tipo as ScannerId;
  const min = tipo === 'condicion_corporal' ? 1 : 0;
  const max = tipo === 'condicion_corporal' ? 9 : 100;
  const puntuacion = Math.min(max, Math.max(min, r.puntuacion));

  const detalles: AnalysisDetail[] = r.detalles.slice(0, 5).map((d) => {
    if (typeof d !== 'object' || d === null) fail('detalle malformado');
    const det = d as Record<string, unknown>;
    if (typeof det.nombre !== 'string' || typeof det.nota !== 'string') fail('detalle malformado');
    const detTipo = typeof det.tipo === 'string' && DETALLE_TIPOS.includes(det.tipo)
      ? (det.tipo as DetalleTipo)
      : 'neutro';
    return { nombre: det.nombre, tipo: detTipo, nota: det.nota };
  });

  const recomendaciones = r.recomendaciones
    .filter((x): x is string => typeof x === 'string')
    .slice(0, 3);

  const peso_estimado_kg =
    typeof r.peso_estimado_kg === 'number' && Number.isFinite(r.peso_estimado_kg)
      ? r.peso_estimado_kg
      : undefined;

  return {
    tipo,
    puntuacion,
    categoria: r.categoria,
    titulo_resultado: r.titulo_resultado,
    explicacion: r.explicacion,
    detalles,
    recomendaciones,
    confianza: r.confianza as Confianza,
    requiere_veterinario: r.requiere_veterinario,
    peso_estimado_kg,
  };
}
