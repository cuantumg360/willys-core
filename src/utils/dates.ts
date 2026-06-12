/** "12 jun, 20:45" — suficiente para el historial, sin librerías. */
export function formatScanDate(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}
