import { APP_NAME } from '@/config/app';
import { HealthRecord, Pet, Reminder, ScanRecord } from '@/store/types';

import { bcsPercentile } from './health';

const C = {
  ink: '#2B2722',
  muted: '#6F695F',
  line: '#E9E2D7',
  soft: '#F1F8F4',
  primary: '#1FA47C',
  primaryDark: '#147A5B',
  good: '#2FB66A',
  warn: '#F0A422',
  bad: '#E5484D',
};

const bcsColor = (bcs: number) =>
  bcs >= 3.5 && bcs <= 5.5 ? C.good : bcs < 2.5 || bcs > 7.5 ? C.bad : C.warn;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

/**
 * Genera el HTML del informe veterinario con marca, pensado para
 * expo-print → PDF. Es un documento (no una pantalla), por eso los textos
 * van en línea, igual que en buildVetReport.
 */
export function buildVetReportHtml(
  pet: Pet,
  scans: ScanRecord[],
  records: HealthRecord[],
  reminders: Reminder[],
): string {
  const today = fmtDate(new Date().toISOString());
  const subtitle =
    [pet.raza, pet.edadAnios ? `${pet.edadAnios} años` : null, pet.pesoKg ? `${pet.pesoKg} kg` : null]
      .filter(Boolean)
      .join(' · ') || 'Sin datos de perfil';

  const lastBcs = scans.find((s) => s.petId === pet.id && s.result.tipo === 'condicion_corporal');
  const petRecords = records.filter((r) => r.petId === pet.id).slice(0, 20);
  const pending = reminders.filter((r) => r.petId === pet.id && !r.done);

  const avatar = pet.fotoUri
    ? `<div class="avatar" style="background-image:url('${esc(pet.fotoUri)}')"></div>`
    : `<div class="avatar avatar-fallback">🐶</div>`;

  // ── Bloque de condición corporal ────────────────────────────────────
  let bcsBlock = '';
  if (lastBcs) {
    const v = lastBcs.result.puntuacion;
    const color = bcsColor(v);
    const pct = bcsPercentile(v);
    const markerLeft = Math.max(0, Math.min(100, ((v - 1) / 8) * 100));
    const recos =
      lastBcs.result.recomendaciones.length > 0
        ? `<div class="reco">
             <div class="reco-title">Recomendaciones</div>
             <ul>${lastBcs.result.recomendaciones.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
           </div>`
        : '';
    bcsBlock = `
      <div class="card">
        <div class="card-title">Condición corporal (BCS)</div>
        <div class="bcs-row">
          <div class="bcs-score" style="color:${color}">${v}<span class="bcs-max">/9</span></div>
          <div class="bcs-meta">
            <span class="tag" style="background:${color}">${esc(lastBcs.result.categoria)}</span>
            <div class="bcs-pct">Mejor que el <b>${pct}%</b> de perros similares</div>
            ${lastBcs.result.peso_estimado_kg ? `<div class="bcs-weight">Peso de referencia: <b>${lastBcs.result.peso_estimado_kg} kg</b></div>` : ''}
          </div>
        </div>
        <div class="scale">
          <div class="scale-bar"><div class="scale-marker" style="left:${markerLeft}%;border-color:${color}"></div></div>
          <div class="scale-labels"><span>1 · Delgado</span><span>4–5 · Ideal</span><span>9 · Obeso</span></div>
        </div>
        ${lastBcs.result.explicacion ? `<p class="explain">${esc(lastBcs.result.explicacion)}</p>` : ''}
        ${recos}
      </div>`;
  }

  // ── Historial médico ────────────────────────────────────────────────
  const historyBlock = petRecords.length
    ? `<div class="card">
         <div class="card-title">Historial médico</div>
         <table>
           ${petRecords
             .map(
               (r) => `<tr>
                 <td class="td-date">${fmtDate(r.date)}</td>
                 <td>${esc(r.title)}${r.kind === 'peso' && r.weightKg ? ` · ${r.weightKg} kg` : ''}${r.notes ? `<span class="td-note">${esc(r.notes)}</span>` : ''}</td>
               </tr>`,
             )
             .join('')}
         </table>
       </div>`
    : '';

  // ── Próximos cuidados ───────────────────────────────────────────────
  const remindersBlock = pending.length
    ? `<div class="card">
         <div class="card-title">Próximos cuidados</div>
         <table>
           ${pending
             .map(
               (r) => `<tr><td class="td-date">${fmtDate(r.dueDate)}</td><td>${esc(r.title)}</td></tr>`,
             )
             .join('')}
         </table>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: ${C.ink}; margin: 0; padding: 0 28px 36px; }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 18px; border-bottom: 2px solid ${C.line}; }
  .brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: ${C.primaryDark}; }
  .brand .paw { width: 34px; height: 34px; border-radius: 11px; background: ${C.primary}; color: #fff; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .header .date { font-size: 12px; color: ${C.muted}; }
  .hero { display: flex; align-items: center; gap: 16px; padding: 22px 0; }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background-size: cover; background-position: center; border: 3px solid ${C.soft}; flex: none; }
  .avatar-fallback { background: ${C.soft}; display:flex; align-items:center; justify-content:center; font-size: 36px; }
  .hero h1 { margin: 0; font-size: 26px; }
  .hero .sub { margin-top: 4px; color: ${C.muted}; font-size: 14px; }
  .doc-title { font-size: 12px; letter-spacing: 1.4px; text-transform: uppercase; color: ${C.primary}; font-weight: 800; }
  .card { border: 1px solid ${C.line}; border-radius: 16px; padding: 18px 20px; margin-top: 16px; }
  .card-title { font-size: 16px; font-weight: 800; margin-bottom: 12px; }
  .bcs-row { display: flex; align-items: center; gap: 20px; }
  .bcs-score { font-size: 54px; font-weight: 800; line-height: 1; }
  .bcs-max { font-size: 22px; color: ${C.muted}; font-weight: 700; }
  .bcs-meta { flex: 1; }
  .tag { display: inline-block; color: #fff; font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 999px; }
  .bcs-pct { margin-top: 8px; font-size: 14px; }
  .bcs-weight { margin-top: 3px; font-size: 14px; color: ${C.muted}; }
  .scale { margin-top: 18px; }
  .scale-bar { position: relative; height: 10px; border-radius: 999px; background: linear-gradient(90deg, ${C.warn}, ${C.good} 45%, ${C.good} 55%, ${C.bad}); }
  .scale-marker { position: absolute; top: -4px; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 4px solid; transform: translateX(-50%); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .scale-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: ${C.muted}; }
  .explain { font-size: 14px; color: ${C.ink}; line-height: 1.5; margin: 14px 0 0; }
  .reco { margin-top: 14px; background: ${C.soft}; border-radius: 12px; padding: 12px 16px; }
  .reco-title { font-weight: 800; font-size: 13px; margin-bottom: 6px; }
  .reco ul { margin: 0; padding-left: 18px; }
  .reco li { font-size: 14px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 0; border-top: 1px solid ${C.line}; font-size: 14px; vertical-align: top; }
  tr:first-child td { border-top: none; }
  .td-date { color: ${C.muted}; white-space: nowrap; width: 90px; }
  .td-note { display: block; color: ${C.muted}; font-size: 12px; margin-top: 2px; }
  .footer { margin-top: 26px; padding-top: 14px; border-top: 1px solid ${C.line}; font-size: 11px; color: ${C.muted}; text-align: center; line-height: 1.6; }
</style></head>
<body>
  <div class="header">
    <div class="brand"><span class="paw">🐾</span>${esc(APP_NAME)}</div>
    <div class="date">${today}</div>
  </div>

  <div class="doc-title" style="margin-top:18px">Informe de salud</div>
  <div class="hero">
    ${avatar}
    <div>
      <h1>${esc(pet.nombre)}</h1>
      <div class="sub">${esc(subtitle)}</div>
    </div>
  </div>

  ${bcsBlock}
  ${historyBlock}
  ${remindersBlock}

  <div class="footer">
    Generado con ${esc(APP_NAME)} 🐾 — Documento orientativo. No sustituye el diagnóstico ni el criterio de un veterinario.
  </div>
</body></html>`;
}
