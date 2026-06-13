import { getSupabase } from '@/services/supabase/client';
import { Pet, ScanRecord } from '@/store/types';

/**
 * Lectura/escritura de mascotas y escaneos en Supabase. La seguridad la
 * dan las RLS policies (cada usuario solo ve sus filas) y la columna
 * user_id se rellena sola con `default auth.uid()` (ver backend/supabase.sql).
 */

interface PetRow {
  id: string;
  nombre: string;
  raza: string | null;
  edad_anios: number | null;
  peso_kg: number | null;
  foto_uri: string | null;
}

interface ScanRow {
  id: string;
  pet_id: string | null;
  scanner_id: string;
  result: ScanRecord['result'];
  photo_uris: string[] | null;
  created_at: string;
}

function toPetRow(p: Pet): PetRow {
  return {
    id: p.id,
    nombre: p.nombre,
    raza: p.raza ?? null,
    edad_anios: p.edadAnios ?? null,
    peso_kg: p.pesoKg ?? null,
    foto_uri: p.fotoUri ?? null,
  };
}

function fromPetRow(r: PetRow): Pet {
  return {
    id: r.id,
    nombre: r.nombre,
    raza: r.raza ?? undefined,
    edadAnios: r.edad_anios ?? undefined,
    pesoKg: r.peso_kg ?? undefined,
    fotoUri: r.foto_uri ?? undefined,
  };
}

function toScanRow(s: ScanRecord): ScanRow {
  return {
    id: s.id,
    pet_id: s.petId ?? null,
    scanner_id: s.scannerId,
    result: s.result,
    photo_uris: s.photoUris,
    created_at: s.createdAt,
  };
}

function fromScanRow(r: ScanRow): ScanRecord {
  return {
    id: r.id,
    scannerId: r.scanner_id as ScanRecord['scannerId'],
    petId: r.pet_id ?? undefined,
    createdAt: r.created_at,
    photoUris: r.photo_uris ?? [],
    result: r.result,
  };
}

export async function pullAll(): Promise<{ pets: Pet[]; scans: ScanRecord[] }> {
  const sb = getSupabase();
  const [pets, scans] = await Promise.all([
    sb.from('pets').select('*'),
    sb.from('scans').select('*').order('created_at', { ascending: false }),
  ]);
  return {
    pets: ((pets.data as PetRow[]) ?? []).map(fromPetRow),
    scans: ((scans.data as ScanRow[]) ?? []).map(fromScanRow),
  };
}

export async function upsertPet(pet: Pet): Promise<void> {
  await getSupabase().from('pets').upsert(toPetRow(pet));
}

export async function deletePet(id: string): Promise<void> {
  // Los escaneos de la mascota se borran en cascada (ver SQL).
  await getSupabase().from('pets').delete().eq('id', id);
}

export async function upsertScan(scan: ScanRecord): Promise<void> {
  await getSupabase().from('scans').upsert(toScanRow(scan));
}

export async function wipeAll(): Promise<void> {
  const sb = getSupabase();
  // Borrar las mascotas arrastra sus escaneos (cascada); limpiamos también
  // los escaneos sin mascota por si los hubiera.
  await sb.from('pets').delete().neq('id', '');
  await sb.from('scans').delete().neq('id', '');
}
