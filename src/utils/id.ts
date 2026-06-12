/** Id local suficiente para registros en el dispositivo (sin backend). */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
