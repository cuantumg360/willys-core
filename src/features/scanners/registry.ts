import { flags } from '@/config/flags';
import { TKey } from '@/i18n';
import { ScannerId } from '@/services/analysis/types';

/**
 * Los escáneres son módulos de configuración que comparten el mismo
 * pipeline foto → IA → resultado. Añadir un escáner nuevo (toxicidad,
 * modo gato…) = añadir una entrada aquí + su prompt en el backend.
 * Ninguna pantalla conoce escáneres concretos: todas leen esta config.
 */

export type OverlayKind = 'dog-top' | 'dog-side' | 'label';

export interface PhotoStep {
  id: string;
  titleKey: TKey;
  hintKey: TKey;
  /** Silueta de guía superpuesta en la cámara. */
  overlay: OverlayKind;
}

export interface ScannerConfig {
  id: ScannerId;
  enabled: boolean;
  emoji: string;
  titleKey: TKey;
  subtitleKey: TKey;
  introKey: TKey;
  photoSteps: PhotoStep[];
  /** Pasos visibles de la animación "escaneando…". */
  analyzingKeys: TKey[];
  /** Cómo se pinta la puntuación en el resultado. */
  resultKind: 'gauge-bcs' | 'score-100';
  scaleLabelKey: TKey;
  /** Si pide raza/edad/peso opcionales antes de escanear. */
  collectsPetInputs: boolean;
}

const bodyCondition: ScannerConfig = {
  id: 'condicion_corporal',
  enabled: true,
  emoji: '⚖️',
  titleKey: 'scanner.bcs.title',
  subtitleKey: 'scanner.bcs.subtitle',
  introKey: 'scanner.bcs.intro',
  photoSteps: [
    { id: 'top', titleKey: 'scanner.bcs.step.top.title', hintKey: 'scanner.bcs.step.top.hint', overlay: 'dog-top' },
    { id: 'side', titleKey: 'scanner.bcs.step.side.title', hintKey: 'scanner.bcs.step.side.hint', overlay: 'dog-side' },
  ],
  analyzingKeys: ['scanner.bcs.analyzing.1', 'scanner.bcs.analyzing.2', 'scanner.bcs.analyzing.3'],
  resultKind: 'gauge-bcs',
  scaleLabelKey: 'scanner.bcs.scale',
  collectsPetInputs: true,
};

const foodLabel: ScannerConfig = {
  id: 'etiqueta',
  enabled: true,
  emoji: '🥣',
  titleKey: 'scanner.label.title',
  subtitleKey: 'scanner.label.subtitle',
  introKey: 'scanner.label.intro',
  photoSteps: [
    { id: 'label', titleKey: 'scanner.label.step.label.title', hintKey: 'scanner.label.step.label.hint', overlay: 'label' },
  ],
  analyzingKeys: ['scanner.label.analyzing.1', 'scanner.label.analyzing.2', 'scanner.label.analyzing.3'],
  resultKind: 'score-100',
  scaleLabelKey: 'scanner.label.scale',
  collectsPetInputs: false,
};

// Fase 2: escáner de toxicidad — misma estructura, detrás de flag.
const ALL_SCANNERS: ScannerConfig[] = [bodyCondition, foodLabel];

export function listScanners(): ScannerConfig[] {
  return ALL_SCANNERS.filter((s) => s.enabled || (s.id === 'toxicidad' && flags.toxicityScanner));
}

export function getScanner(id: string): ScannerConfig | undefined {
  return ALL_SCANNERS.find((s) => s.id === id);
}
