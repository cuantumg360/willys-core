/** Freemium duro: 3 escaneos gratis EN TOTAL (no por semana). */
export const FREE_SCANS_TOTAL = 3;

/** Máximo de perros en el plan gratis (ilimitados en premium). */
export const FREE_PET_LIMIT = 1;

/** Máximo de perfiles de mascota en premium (una misma cuenta). */
export const MAX_PETS = 5;

/** ¿Puede añadir otra mascota según su plan y cuántas tiene ya? */
export function canAddPet(premium: boolean, petCount: number): boolean {
  return petCount < (premium ? MAX_PETS : FREE_PET_LIMIT);
}

/** Lado mayor máximo (px) de las imágenes antes de enviarlas a analizar. */
export const MAX_IMAGE_SIZE = 1024;

/** Calidad JPEG de compresión antes del análisis. */
export const IMAGE_COMPRESSION = 0.7;
